import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

type Period = "today" | "week" | "month"

function getPeriodDates(period: Period) {
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0)
      break
    case "week":
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday as first day
      startDate.setDate(now.getDate() - diff)
      startDate.setHours(0, 0, 0, 0)
      break
    case "month":
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      break
  }

  // Calculate previous period for trend comparison
  const periodLength = now.getTime() - startDate.getTime()
  const previousStart = new Date(startDate.getTime() - periodLength)

  return {
    currentStart: startDate.toISOString(),
    previousStart: previousStart.toISOString(),
    currentEnd: now.toISOString(),
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get("period") || "month") as Period
    const agentId = params.id

    const supabase = createAdminClient()
    const { currentStart, previousStart, currentEnd } = getPeriodDates(period)

    // Total Conversations
    const { count: currentConversations } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agentId)
      .gte("created_at", currentStart)
      .lte("created_at", currentEnd)

    const { count: previousConversations } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agentId)
      .gte("created_at", previousStart)
      .lt("created_at", currentStart)

    const conversationsChange =
      previousConversations && previousConversations > 0
        ? ((currentConversations || 0) - previousConversations) / previousConversations * 100
        : 0

    // Satisfaction Rating
    const { data: currentRatings } = await supabase
      .from("conversations")
      .select("rating")
      .eq("agent_id", agentId)
      .gte("created_at", currentStart)
      .lte("created_at", currentEnd)
      .not("rating", "is", null)

    const currentAvgRating =
      currentRatings && currentRatings.length > 0
        ? currentRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / currentRatings.length
        : 0

    const { data: previousRatings } = await supabase
      .from("conversations")
      .select("rating")
      .eq("agent_id", agentId)
      .gte("created_at", previousStart)
      .lt("created_at", currentStart)
      .not("rating", "is", null)

    const previousAvgRating =
      previousRatings && previousRatings.length > 0
        ? previousRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / previousRatings.length
        : 0

    const satisfactionChange =
      previousAvgRating > 0
        ? ((currentAvgRating - previousAvgRating) / previousAvgRating) * 100
        : 0

    // Convert 5-star rating to percentage (multiply by 20)
    const satisfactionPercentage = Math.round(currentAvgRating * 20)

    // Average Conversation Length
    const { data: currentLengths } = await supabase
      .from("conversations")
      .select("message_count")
      .eq("agent_id", agentId)
      .gte("created_at", currentStart)
      .lte("created_at", currentEnd)
      .gt("message_count", 0)

    const currentAvgLength =
      currentLengths && currentLengths.length > 0
        ? currentLengths.reduce((sum, c) => sum + (c.message_count || 0), 0) / currentLengths.length
        : 0

    const { data: previousLengths } = await supabase
      .from("conversations")
      .select("message_count")
      .eq("agent_id", agentId)
      .gte("created_at", previousStart)
      .lt("created_at", currentStart)
      .gt("message_count", 0)

    const previousAvgLength =
      previousLengths && previousLengths.length > 0
        ? previousLengths.reduce((sum, c) => sum + (c.message_count || 0), 0) / previousLengths.length
        : 0

    const lengthChange =
      previousAvgLength > 0
        ? ((currentAvgLength - previousAvgLength) / previousAvgLength) * 100
        : 0

    // Unique Users
    const { data: currentUsers } = await supabase
      .from("conversations")
      .select("visitor_id")
      .eq("agent_id", agentId)
      .gte("created_at", currentStart)
      .lte("created_at", currentEnd)

    const uniqueCurrentUsers = new Set(currentUsers?.map(c => c.visitor_id) || []).size

    const { data: previousUsers } = await supabase
      .from("conversations")
      .select("visitor_id")
      .eq("agent_id", agentId)
      .gte("created_at", previousStart)
      .lt("created_at", currentStart)

    const uniquePreviousUsers = new Set(previousUsers?.map(c => c.visitor_id) || []).size

    const usersChange =
      uniquePreviousUsers > 0
        ? ((uniqueCurrentUsers - uniquePreviousUsers) / uniquePreviousUsers) * 100
        : 0

    // Weekly Data (conversations by day)
    const weeklyData = []
    const daysOfWeek = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"]

    if (period === "week") {
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(currentStart)
        dayStart.setDate(dayStart.getDate() + i)
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const { count } = await supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("agent_id", agentId)
          .gte("created_at", dayStart.toISOString())
          .lt("created_at", dayEnd.toISOString())

        weeklyData.push({
          day: daysOfWeek[i],
          conversations: count || 0,
        })
      }
    } else {
      // For today/month, show last 7 days
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date()
        dayStart.setDate(dayStart.getDate() - i)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const { count } = await supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("agent_id", agentId)
          .gte("created_at", dayStart.toISOString())
          .lt("created_at", dayEnd.toISOString())

        weeklyData.push({
          day: daysOfWeek[dayStart.getDay() === 0 ? 6 : dayStart.getDay() - 1],
          conversations: count || 0,
        })
      }
    }

    // Top Questions (from clusters)
    const { data: topClusters } = await supabase
      .from("question_clusters")
      .select("representative_question, question_count")
      .eq("agent_id", agentId)
      .gte("last_asked", currentStart)
      .order("question_count", { ascending: false })
      .limit(5)

    const topQuestions = topClusters?.map(cluster => ({
      question: cluster.representative_question,
      count: cluster.question_count,
    })) || []

    return NextResponse.json({
      stats: {
        conversations: {
          value: currentConversations || 0,
          change: Math.round(conversationsChange * 10) / 10,
          trend: conversationsChange >= 0 ? "up" : "down",
        },
        satisfaction: {
          value: satisfactionPercentage,
          change: Math.round(satisfactionChange * 10) / 10,
          trend: satisfactionChange >= 0 ? "up" : "down",
        },
        avgConversationLength: {
          value: Math.round(currentAvgLength * 10) / 10,
          change: Math.round(lengthChange * 10) / 10,
          trend: lengthChange >= 0 ? "up" : "down",
        },
        uniqueUsers: {
          value: uniqueCurrentUsers,
          change: Math.round(usersChange * 10) / 10,
          trend: usersChange >= 0 ? "up" : "down",
        },
      },
      weeklyData,
      topQuestions,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
