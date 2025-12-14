import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Params = {
  params: Promise<{ id: string }>
}

// GET /api/agents/[id]/knowledge/custom - Hent alle custom entries for agent
export async function GET(request: Request, { params }: Params) {
  const { id: agentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verificer at brugeren ejer agenten
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("user_id", user.id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const { data, error } = await (supabase
    .from("knowledge_custom") as any)
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/agents/[id]/knowledge/custom - Opret ny custom entry
export async function POST(request: Request, { params }: Params) {
  const { id: agentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verificer at brugeren ejer agenten
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("user_id", user.id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const body = await request.json()

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  const insertData = {
    agent_id: agentId,
    title: body.title.trim(),
    content: body.content.trim(),
  }

  const { data, error } = await (supabase
    .from("knowledge_custom") as any)
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/agents/[id]/knowledge/custom - Opdater custom entry
export async function PATCH(request: Request, { params }: Params) {
  const { id: agentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verificer at brugeren ejer agenten
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("user_id", user.id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const entryId = searchParams.get("entryId")

  if (!entryId) {
    return NextResponse.json({ error: "entryId required" }, { status: 400 })
  }

  const body = await request.json()

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  const { data, error } = await (supabase
    .from("knowledge_custom") as any)
    .update({
      title: body.title.trim(),
      content: body.content.trim(),
    })
    .eq("id", entryId)
    .eq("agent_id", agentId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/agents/[id]/knowledge/custom - Slet custom entry
export async function DELETE(request: Request, { params }: Params) {
  const { id: agentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verificer at brugeren ejer agenten
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("user_id", user.id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const entryId = searchParams.get("entryId")

  if (!entryId) {
    return NextResponse.json({ error: "entryId required" }, { status: 400 })
  }

  const { error } = await (supabase
    .from("knowledge_custom") as any)
    .delete()
    .eq("id", entryId)
    .eq("agent_id", agentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
