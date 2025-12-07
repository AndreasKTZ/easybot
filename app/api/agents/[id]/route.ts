import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// Hent agent info (public endpoint til widget)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: agent, error } = await supabase
      .from("agents")
      .select("id, agent_name, business_name, tone, branding")
      .eq("id", id)
      .single()

    if (error || !agent) {
      return NextResponse.json(
        { error: "Agent ikke fundet" },
        { status: 404 }
      )
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error("Fejl ved hentning af agent:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente agent" },
      { status: 500 }
    )
  }
}

// Opdater agent (kræver auth)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Tjek auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Tjek at brugeren ejer agenten
    const { data: existingAgent } = await supabase
      .from("agents")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existingAgent || existingAgent.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    const { data: agent, error } = await supabase
      .from("agents")
      .update({
        ...(body.business_name && { business_name: body.business_name }),
        ...(body.agent_name && { agent_name: body.agent_name }),
        ...(body.primary_role && { primary_role: body.primary_role }),
        ...(body.scopes && { scopes: body.scopes }),
        ...(body.tone && { tone: body.tone }),
        ...(body.branding && { branding: body.branding }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Fejl ved opdatering af agent:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error("Fejl ved opdatering af agent:", error)
    return NextResponse.json(
      { error: "Kunne ikke opdatere agent" },
      { status: 500 }
    )
  }
}
