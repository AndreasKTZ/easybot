-- Easybot Database Schema
-- Kør dette i Supabase SQL Editor

-- Agents tabel
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  business_name text not null,
  agent_name text not null,
  primary_role text not null,
  scopes text[] not null default '{}',
  tone text not null default 'friendly',
  branding jsonb not null default '{
    "primary_color": "#0d9488",
    "icon_id": "ai-brain",
    "icon_style": "bulk",
    "logo_url": null
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Knowledge links tabel (til fremtidig RAG)
create table if not exists public.knowledge_links (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  label text not null,
  url text not null,
  created_at timestamptz not null default now()
);

-- Knowledge documents tabel (til fremtidig RAG)
create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Conversations tabel
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages tabel
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes for bedre performance
create index if not exists agents_user_id_idx on public.agents(user_id);
create index if not exists knowledge_links_agent_id_idx on public.knowledge_links(agent_id);
create index if not exists knowledge_documents_agent_id_idx on public.knowledge_documents(agent_id);
create index if not exists conversations_agent_id_idx on public.conversations(agent_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);

-- Row Level Security (RLS)
alter table public.agents enable row level security;
alter table public.knowledge_links enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies for agents
create policy "Users can view own agents"
  on public.agents for select
  using (auth.uid() = user_id);

create policy "Users can create own agents"
  on public.agents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own agents"
  on public.agents for update
  using (auth.uid() = user_id);

create policy "Users can delete own agents"
  on public.agents for delete
  using (auth.uid() = user_id);

-- Policies for knowledge_links
create policy "Users can view own agent links"
  on public.knowledge_links for select
  using (agent_id in (select id from public.agents where user_id = auth.uid()));

create policy "Users can create links for own agents"
  on public.knowledge_links for insert
  with check (agent_id in (select id from public.agents where user_id = auth.uid()));

create policy "Users can update own agent links"
  on public.knowledge_links for update
  using (agent_id in (select id from public.agents where user_id = auth.uid()));

create policy "Users can delete own agent links"
  on public.knowledge_links for delete
  using (agent_id in (select id from public.agents where user_id = auth.uid()));

-- Policies for knowledge_documents
create policy "Users can view own agent documents"
  on public.knowledge_documents for select
  using (agent_id in (select id from public.agents where user_id = auth.uid()));

create policy "Users can create documents for own agents"
  on public.knowledge_documents for insert
  with check (agent_id in (select id from public.agents where user_id = auth.uid()));

create policy "Users can update own agent documents"
  on public.knowledge_documents for update
  using (agent_id in (select id from public.agents where user_id = auth.uid()));

create policy "Users can delete own agent documents"
  on public.knowledge_documents for delete
  using (agent_id in (select id from public.agents where user_id = auth.uid()));

-- Policies for conversations (public read for widget)
create policy "Anyone can view conversations by agent"
  on public.conversations for select
  using (true);

create policy "Anyone can create conversations"
  on public.conversations for insert
  with check (true);

create policy "Anyone can update conversations"
  on public.conversations for update
  using (true);

-- Policies for messages (public read/write for widget)
create policy "Anyone can view messages"
  on public.messages for select
  using (true);

create policy "Anyone can create messages"
  on public.messages for insert
  with check (true);

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger agents_updated_at
  before update on public.agents
  for each row execute function public.handle_updated_at();

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- Storage bucket til dokumenter
-- Kør dette separat i Supabase SQL Editor eller opret via Dashboard
insert into storage.buckets (id, name, public)
values ('knowledge-documents', 'knowledge-documents', false)
on conflict (id) do nothing;

-- Storage policies for knowledge-documents bucket
create policy "Users can upload documents for own agents"
  on storage.objects for insert
  with check (
    bucket_id = 'knowledge-documents' and
    (storage.foldername(name))[1] in (
      select id::text from public.agents where user_id = auth.uid()
    )
  );

create policy "Users can view documents for own agents"
  on storage.objects for select
  using (
    bucket_id = 'knowledge-documents' and
    (storage.foldername(name))[1] in (
      select id::text from public.agents where user_id = auth.uid()
    )
  );

create policy "Users can delete documents for own agents"
  on storage.objects for delete
  using (
    bucket_id = 'knowledge-documents' and
    (storage.foldername(name))[1] in (
      select id::text from public.agents where user_id = auth.uid()
    )
  );
