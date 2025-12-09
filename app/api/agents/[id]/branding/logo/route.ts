import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BUCKET = "knowledge-documents"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const { data: existingAgent, error: agentError } = await (supabase
    .from("agents") as any)
    .select("user_id")
    .eq("id", id)
    .single()

  if (agentError || !existingAgent || existingAgent.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Ingen fil modtaget" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Fil skal være et billede" }, { status: 400 })
  }

  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Maks størrelse er 2 MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png"
  const filePath = `${id}/branding/logo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

  return NextResponse.json({ url: publicUrl.publicUrl })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { data: existingAgent, error: agentError } = await (supabase
    .from("agents") as any)
    .select("user_id")
    .eq("id", id)
    .single()

  if (agentError || !existingAgent || existingAgent.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const url = body?.url as string | undefined
  if (!url) {
    return NextResponse.json({ error: "Ingen URL angivet" }, { status: 400 })
  }

  const pathname = new URL(url).pathname
  const splitKey = `/public/${BUCKET}/`
  const path = pathname.includes(splitKey) ? pathname.split(splitKey)[1] : null

  if (!path) {
    return NextResponse.json({ error: "Kunne ikke udlede filsti" }, { status: 400 })
  }

  const { error: deleteError } = await supabase.storage.from(BUCKET).remove([path])

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

