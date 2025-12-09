import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { rating } = await request.json()
    const conversationId = params.id

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating. Must be between 1 and 5" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Validate conversation exists
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .single()

    if (fetchError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Update conversation with rating
    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        rating,
        rated_at: new Date().toISOString(),
      })
      .eq("id", conversationId)

    if (updateError) {
      console.error("Error updating conversation rating:", updateError)
      return NextResponse.json({ error: "Failed to save rating" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in rating endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
