import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Params = {
  params: Promise<{ id: string }>
}

// GET /api/agents/[id]/knowledge/documents - Hent alle dokumenter for agent
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

  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/agents/[id]/knowledge/documents - Upload dokument metadata
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

  const { data, error } = await supabase
    .from("knowledge_documents")
    .insert({
      agent_id: agentId,
      name: body.name,
      file_type: body.fileType,
      file_size: body.fileSize,
      storage_path: body.storagePath || `documents/${agentId}/${body.name}`,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/agents/[id]/knowledge/documents - Slet dokument
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
  const documentId = searchParams.get("documentId")

  if (!documentId) {
    return NextResponse.json({ error: "documentId required" }, { status: 400 })
  }

  const { error } = await supabase
    .from("knowledge_documents")
    .delete()
    .eq("id", documentId)
    .eq("agent_id", agentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

