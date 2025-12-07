import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/agents - Hent alle agents for brugeren
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await (supabase
    .from("agents") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/agents - Opret ny agent
export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const insertData = {
    user_id: user.id,
    business_name: body.businessName as string,
    agent_name: body.agentName as string,
    primary_role: body.primaryRole as string,
    scopes: body.scopes || [],
    tone: body.tone || "friendly",
    branding: body.branding || {
      primary_color: "#0d9488",
      icon_id: "ai-brain",
      icon_style: "bulk",
      logo_url: null,
    },
  }

  const { data, error } = await (supabase
    .from("agents") as any)
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

