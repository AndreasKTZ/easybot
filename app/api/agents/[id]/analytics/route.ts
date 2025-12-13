import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

type Period = "today" | "week" | "month"

const MS_PER_DAY = 24 * 60 * 60 * 1000

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get("period") || "month") as Period
    const { id: agentId } = await params

    const supabase = createAdminClient()
    const { currentStart, previousStart, currentEnd } = getPeriodDates(period)

    const [
      currentConvRes,
      previousConvRes,
      currentRatingsRes,
      previousRatingsRes,
      currentLengthsRes,
      previousLengthsRes,
      currentUsersRes,
      previousUsersRes,
      bucketRes,
      topClustersRes,
    ] = await Promise.all([
      supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("agent_id", agentId)
        .gte("created_at", currentStart)
        .lte("created_at", currentEnd),
      supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("agent_id", agentId)
        .gte("created_at", previousStart)
        .lt("created_at", currentStart),
      // Get all ratings for current period to calculate average manually
      supabase
        .from("conversations")
        .select("rating")
        .eq("agent_id", agentId)
        .gte("created_at", currentStart)
        .lte("created_at", currentEnd)
        .not("rating", "is", null),
      // Get all ratings for previous period
      supabase
        .from("conversations")
        .select("rating")
        .eq("agent_id", agentId)
        .gte("created_at", previousStart)
        .lt("created_at", currentStart)
        .not("rating", "is", null),
      // Get all message counts for current period
      supabase
        .from("conversations")
        .select("message_count")
        .eq("agent_id", agentId)
        .gte("created_at", currentStart)
        .lte("created_at", currentEnd)
        .gt("message_count", 0),
      // Get all message counts for previous period
      supabase
        .from("conversations")
        .select("message_count")
        .eq("agent_id", agentId)
        .gte("created_at", previousStart)
        .lt("created_at", currentStart)
        .gt("message_count", 0),
      supabase
        .from("conversations")
        .select("visitor_id")
        .eq("agent_id", agentId)
        .gte("created_at", currentStart)
        .lte("created_at", currentEnd),
      supabase
        .from("conversations")
        .select("visitor_id")
        .eq("agent_id", agentId)
        .gte("created_at", previousStart)
        .lt("created_at", currentStart),
      supabase
        .from("conversations")
        .select("created_at")
        .eq("agent_id", agentId)
        .gte("created_at", currentStart)
        .lte("created_at", currentEnd),
      supabase
        .from("question_clusters")
        .select("representative_question, question_count")
        .eq("agent_id", agentId)
        .gte("last_asked", currentStart)
        .order("question_count", { ascending: false })
        .limit(5),
    ])

    const currentConversations = currentConvRes.count || 0
    const previousConversations = previousConvRes.count || 0
    const conversationsChange =
      previousConversations && previousConversations > 0
        ? ((currentConversations || 0) - previousConversations) / previousConversations * 100
        : 0

    // Calculate average rating manually
    const currentRatings = (currentRatingsRes.data || []) as Array<{ rating: number }>
    const previousRatings = (previousRatingsRes.data || []) as Array<{ rating: number }>

    const currentAvgRating = currentRatings.length > 0
      ? currentRatings.reduce((sum, r) => sum + r.rating, 0) / currentRatings.length
      : 0
    const previousAvgRating = previousRatings.length > 0
      ? previousRatings.reduce((sum, r) => sum + r.rating, 0) / previousRatings.length
      : 0

    const satisfactionChange =
      previousAvgRating > 0
        ? ((currentAvgRating - previousAvgRating) / previousAvgRating) * 100
        : 0

    // Convert 5-star rating to percentage (multiply by 20)
    const satisfactionPercentage = Math.round(currentAvgRating * 20)

    // Calculate average message count manually
    const currentLengths = (currentLengthsRes.data || []) as Array<{ message_count: number }>
    const previousLengths = (previousLengthsRes.data || []) as Array<{ message_count: number }>

    const currentAvgLength = currentLengths.length > 0
      ? currentLengths.reduce((sum, c) => sum + c.message_count, 0) / currentLengths.length
      : 0
    const previousAvgLength = previousLengths.length > 0
      ? previousLengths.reduce((sum, c) => sum + c.message_count, 0) / previousLengths.length
      : 0

    const lengthChange =
      previousAvgLength > 0
        ? ((currentAvgLength - previousAvgLength) / previousAvgLength) * 100
        : 0

    const uniqueCurrentUsers = new Set(
      currentUsersRes.data?.map((c: { visitor_id: string | null }) => c.visitor_id) || []
    ).size
    const uniquePreviousUsers = new Set(
      previousUsersRes.data?.map((c: { visitor_id: string | null }) => c.visitor_id) || []
    ).size

    const usersChange =
      uniquePreviousUsers > 0
        ? ((uniqueCurrentUsers - uniquePreviousUsers) / uniquePreviousUsers) * 100
        : 0

    const buckets = (() => {
      const rows = bucketRes.data || []

      if (period === "today") {
        const bucketArr = Array.from({ length: 24 }, (_, hour) => ({
          label: hour.toString().padStart(2, "0"),
          value: 0,
        }))

        rows.forEach((row: { created_at: string }) => {
          const hour = new Date(row.created_at).getHours()
          if (hour >= 0 && hour < 24) {
            bucketArr[hour].value += 1
          }
        })

        return bucketArr
      }

      if (period === "week") {
        const start = new Date(currentStart)
        start.setHours(0, 0, 0, 0)
        const daysOfWeek = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"]
        const bucketArr = Array.from({ length: 7 }, (_, idx) => ({
          label: daysOfWeek[idx],
          value: 0,
        }))

        rows.forEach((row: { created_at: string }) => {
          const day = new Date(row.created_at)
          const diff = Math.floor((day.getTime() - start.getTime()) / MS_PER_DAY)
          if (diff >= 0 && diff < 7) {
            bucketArr[diff].value += 1
          }
        })

        return bucketArr
      }

      // month (day buckets)
      const start = new Date(currentStart)
      start.setHours(0, 0, 0, 0)
      const endDay = new Date(currentEnd)
      endDay.setHours(0, 0, 0, 0)
      const daysInRange = Math.max(1, Math.floor((endDay.getTime() - start.getTime()) / MS_PER_DAY) + 1)

      const bucketArr = Array.from({ length: daysInRange }, (_, idx) => ({
        label: (idx + 1).toString(),
        value: 0,
      }))

      rows.forEach((row: { created_at: string }) => {
        const day = new Date(row.created_at)
        const diff = Math.floor((day.getTime() - start.getTime()) / MS_PER_DAY)
        if (diff >= 0 && diff < daysInRange) {
          bucketArr[diff].value += 1
        }
      })

      return bucketArr
    })()

    const topQuestions = topClustersRes.data?.map((cluster: { representative_question: string; question_count: number }) => ({
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
      buckets,
      topQuestions,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
