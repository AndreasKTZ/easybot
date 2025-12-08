import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Params = {
  params: Promise<{ id: string }>
}

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function getFileExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "text/plain": "TXT",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  }
  return map[mimeType] || "FILE"
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

// POST /api/agents/[id]/knowledge/documents - Upload dokument
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

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 })
  }

  // Generer unik sti: agentId/timestamp-filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const storagePath = `${agentId}/${timestamp}-${safeName}`

  // Upload til Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("knowledge-documents")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Gem metadata i database
  const insertData = {
    agent_id: agentId,
    name: file.name,
    file_type: getFileExtension(file.type),
    file_size: file.size,
    storage_path: storagePath,
  }

  const { data, error } = await (supabase
    .from("knowledge_documents") as any)
    .insert(insertData)
    .select()
    .single()

  if (error) {
    // Forsøg at slette uploadet fil hvis database insert fejler
    await supabase.storage.from("knowledge-documents").remove([storagePath])
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

