import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

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
