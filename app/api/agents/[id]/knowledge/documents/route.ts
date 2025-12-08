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

  const { data, error } = await (supabase
    .from("knowledge_documents") as any)
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/agents/[id]/knowledge/documents - Gem dokument metadata (fil uploades fra klient)
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
  const { name, fileType, fileSize, storagePath } = body

  if (!name || !fileType || !fileSize || !storagePath) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Verificer at storage path starter med agentId (sikkerhed)
  if (!storagePath.startsWith(`${agentId}/`)) {
    return NextResponse.json({ error: "Invalid storage path" }, { status: 400 })
  }

  const insertData = {
    agent_id: agentId,
    name,
    file_type: fileType,
    file_size: fileSize,
    storage_path: storagePath,
  }

  const { data, error } = await (supabase
    .from("knowledge_documents") as any)
    .insert(insertData)
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

  // Hent dokument for at få storage_path
  const { data: doc } = await (supabase
    .from("knowledge_documents") as any)
    .select("storage_path")
    .eq("id", documentId)
    .eq("agent_id", agentId)
    .single()

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  // Slet fra storage
  await supabase.storage.from("knowledge-documents").remove([doc.storage_path])

  // Slet fra database
  const { error } = await (supabase
    .from("knowledge_documents") as any)
    .delete()
    .eq("id", documentId)
    .eq("agent_id", agentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

