// Database types genereret fra Supabase schema

export type AgentScope =
  | "products"
  | "subscriptions"
  | "orders"
  | "invoices"
  | "support"
  | "general"

export type AgentTone =
  | "friendly"
  | "professional"
  | "direct"
  | "educational"

export type IconStyle = "bulk" | "solid"

export type AgentBranding = {
  primary_color: string
  icon_id: string
  icon_style: IconStyle
  logo_url: string | null
}

export type Agent = {
  id: string
  user_id: string
  business_name: string
  agent_name: string
  primary_role: string
  scopes: AgentScope[]
  tone: AgentTone
  branding: AgentBranding
  created_at: string
  updated_at: string
}

export type KnowledgeLink = {
  id: string
  agent_id: string
  label: string
  url: string
  created_at: string
}

export type KnowledgeDocument = {
  id: string
  agent_id: string
  name: string
  file_type: string
  file_size: number
  storage_path: string
  summary: string | null
  created_at: string
}

export type Conversation = {
  id: string
  agent_id: string
  visitor_id: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      agents: {
        Row: Agent
        Insert: Omit<Agent, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Agent, "id" | "created_at" | "updated_at">>
      }
      knowledge_links: {
        Row: KnowledgeLink
        Insert: Omit<KnowledgeLink, "id" | "created_at">
        Update: Partial<Omit<KnowledgeLink, "id" | "created_at">>
      }
      knowledge_documents: {
        Row: KnowledgeDocument
        Insert: Omit<KnowledgeDocument, "id" | "created_at">
        Update: Partial<Omit<KnowledgeDocument, "id" | "created_at">>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Conversation, "id" | "created_at" | "updated_at">>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, "id" | "created_at">
        Update: Partial<Omit<Message, "id" | "created_at">>
      }
    }
  }
}

