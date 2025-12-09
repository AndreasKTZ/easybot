import { createAdminClient } from "@/lib/supabase/admin"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

const ClusterSchema = z.object({
  clusters: z.array(
    z.object({
      representative_question: z.string(),
      similar_questions: z.array(z.string()),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const { agentId } = await request.json()

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get unclustered user messages
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        conversation_id,
        conversations!inner(agent_id)
      `)
      .eq("role", "user")
      .eq("conversations.agent_id", agentId)
      .not("id", "in", `(select message_id from clustered_messages)`)
      .limit(50)

    if (messagesError || !messages || messages.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No messages to cluster",
        clustered: 0,
      })
    }

    // Prepare questions for clustering
    const questions = messages.map((m) => m.content)

    // Use AI to cluster similar questions
    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: ClusterSchema,
      prompt: `Analyze these customer questions and group similar ones together.
Create clusters where questions are asking about the same topic or information.
For each cluster, select the clearest question as the representative question.

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return JSON with clusters of similar questions.`,
    })

    let clusteredCount = 0

    // Process each cluster
    for (const cluster of object.clusters) {
      // Find existing similar cluster
      const { data: existingClusters } = await supabase
        .from("question_clusters")
        .select("id, representative_question, question_count")
        .eq("agent_id", agentId)

      let matchingCluster = null

      if (existingClusters && existingClusters.length > 0) {
        // Use AI to find if this cluster matches an existing one
        const { object: matchResult } = await generateObject({
          model: google("gemini-2.5-flash-lite"),
          schema: z.object({ matchingIndex: z.number().nullable() }),
          prompt: `Does this question match any of the existing clusters?
New question: "${cluster.representative_question}"

Existing clusters:
${existingClusters.map((c, i) => `${i}. ${c.representative_question}`).join("\n")}

If it matches one of the existing clusters (same topic/intent), return the index number.
If it doesn't match any, return null.`,
        })

        if (matchResult.matchingIndex !== null) {
          matchingCluster = existingClusters[matchResult.matchingIndex]
        }
      }

      if (matchingCluster) {
        // Update existing cluster
        await supabase
          .from("question_clusters")
          .update({
            question_count: matchingCluster.question_count + cluster.similar_questions.length,
            last_asked: new Date().toISOString(),
          })
          .eq("id", matchingCluster.id)

        // Link messages to cluster
        for (const question of cluster.similar_questions) {
          const message = messages.find((m) => m.content === question)
          if (message) {
            await supabase.from("clustered_messages").insert({
              message_id: message.id,
              cluster_id: matchingCluster.id,
            })
            clusteredCount++
          }
        }
      } else {
        // Create new cluster
        const { data: newCluster, error: clusterError } = await supabase
          .from("question_clusters")
          .insert({
            agent_id: agentId,
            representative_question: cluster.representative_question,
            question_count: cluster.similar_questions.length,
            last_asked: new Date().toISOString(),
          })
          .select("id")
          .single()

        if (!clusterError && newCluster) {
          // Link messages to new cluster
          for (const question of cluster.similar_questions) {
            const message = messages.find((m) => m.content === question)
            if (message) {
              await supabase.from("clustered_messages").insert({
                message_id: message.id,
                cluster_id: newCluster.id,
              })
              clusteredCount++
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully clustered ${clusteredCount} messages into ${object.clusters.length} clusters`,
      clustered: clusteredCount,
      clusters: object.clusters.length,
    })
  } catch (error) {
    console.error("Error clustering questions:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
