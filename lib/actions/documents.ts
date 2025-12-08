"use server"

import { createClient } from "@/lib/supabase/server"

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

export async function uploadDocument(agentId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  // Verificer at brugeren ejer agenten
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("user_id", user.id)
    .single()

  if (!agent) {
    return { error: "Agent not found" }
  }

  const file = formData.get("file") as File | null

  if (!file) {
    return { error: "No file provided" }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Invalid file type" }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "File too large (max 10 MB)" }
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
    return { error: uploadError.message }
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
    return { error: error.message }
  }

  return { data }
}
