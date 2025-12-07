import { google } from "@ai-sdk/google"
import { streamText, convertToModelMessages } from "ai"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Agent, KnowledgeLink } from "@/lib/supabase/types"

// Tillad streaming responses op til 30 sekunder
export const maxDuration = 30

// Tone-beskrivelser til system prompt
const toneDescriptions: Record<string, string> = {
  friendly: "Du er venlig, uformel og imødekommende. Brug gerne emojis sparsomt.",
  professional: "Du er rolig, professionel og saglig. Hold en formel tone.",
  direct: "Du er kort og direkte. Giv præcise svar uden unødvendigt fyld.",
  educational: "Du er forklarende og pædagogisk. Hjælp brugeren med at forstå.",
}

// Scope-beskrivelser til system prompt
const scopeDescriptions: Record<string, string> = {
  products: "produkter og services",
  subscriptions: "abonnementer og priser",
  orders: "ordrer og bestillinger",
  invoices: "fakturaer og betaling",
  support: "teknisk support",
  general: "generelle spørgsmål",
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Chat API request body:", JSON.stringify(body, null, 2))
    
    // AI SDK v5 sender messages i et andet format
    const messages = body.messages || []
    const agentId = body.agentId

    // Hvis ingen agentId, brug default system prompt
    let systemPrompt = "Du er en venlig AI-assistent. Svar altid på dansk."
    
    console.log("Agent ID received:", agentId)
    
    if (agentId) {
      const supabase = createAdminClient()

      // Hent agent konfiguration
      const { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .single()

      console.log("Agent query result:", { agentData, agentError })

      if (!agentError && agentData) {
        console.log("Using custom agent:", agentData.agent_name)
        const agent = agentData as unknown as Agent

        // Hent knowledge links for agenten
        const { data: linksData } = await supabase
          .from("knowledge_links")
          .select("*")
          .eq("agent_id", agentId)

        const links = (linksData || []) as unknown as KnowledgeLink[]

        // Byg system prompt baseret på agent konfiguration
        const scopeList = agent.scopes
          .map((s: string) => scopeDescriptions[s] || s)
          .join(", ")

        // Byg knowledge sektion hvis der er links
        let knowledgeSection = ""
        if (links.length > 0) {
          const linksList = links
            .map((link) => `- ${link.label}: ${link.url}`)
            .join("\n")
          knowledgeSection = `

## Vidensbase
Du har adgang til følgende ressourcer som du kan henvise til:
${linksList}

Når det er relevant, henvis brugeren til disse ressourcer for mere information.`
        }

        systemPrompt = `Du er ${agent.agent_name}, en AI-assistent for ${agent.business_name}.

${toneDescriptions[agent.tone] || toneDescriptions.friendly}

Du kan hjælpe med følgende emner: ${scopeList}.${knowledgeSection}

## Vigtige retningslinjer
- Svar altid på dansk
- Hold dig til de emner du kan hjælpe med
- Hvis du ikke kan svare på et spørgsmål, forklar venligt hvad du kan hjælpe med i stedet
- Vær hjælpsom og løsningsorienteret
- Hvis brugeren har brug for menneskelig hjælp, opfordr dem til at kontakte kundeservice
- Henvis til relevante links fra vidensbasen når det giver mening`
      } else {
        console.log("Agent not found or error, using default prompt")
      }
    } else {
      console.log("No agentId provided, using default prompt")
    }
    
    console.log("Final system prompt:", systemPrompt.substring(0, 100) + "...")

    // Konverter UIMessage[] til ModelMessage[] format
    const modelMessages = convertToModelMessages(messages)

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: modelMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
