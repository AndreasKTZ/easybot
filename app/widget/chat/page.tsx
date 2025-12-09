"use client"

import { Suspense, useEffect, useRef, useState, useMemo, FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain01Icon,
  ChatBotIcon,
  BubbleChatSparkIcon,
  ArtificialIntelligence02Icon,
  AiMagicIcon,
  CustomerSupportIcon,
  BubbleChatQuestionIcon,
  BubbleChatIcon,
  SentIcon,
} from "@hugeicons-pro/core-bulk-rounded"
import { ConversationRating } from "@/components/chat/conversation-rating"

// Markdown-parsing for fed tekst og links
function parseMessageContent(content: string, linkColor?: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  // Kombineret regex for **bold** og [link](url)
  const regex = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match
  let keyIndex = 0

  while ((match = regex.exec(content)) !== null) {
    // Tilføj tekst før match
    if (match.index > lastIndex) {
      result.push(content.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // Fed tekst: **text**
      result.push(
        <strong key={keyIndex++} className="font-semibold">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
      // Link: [text](url)
      result.push(
        <a
          key={keyIndex++}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
          style={linkColor ? { color: linkColor } : undefined}
        >
          {match[4]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Tilføj resterende tekst
  if (lastIndex < content.length) {
    result.push(content.slice(lastIndex))
  }

  return result.length > 0 ? result : [content]
}

// Ikon mapping baseret på branding icon_id
const iconComponents: Record<string, typeof AiBrain01Icon> = {
  "ai-brain": AiBrain01Icon,
  "chatbot": ChatBotIcon,
  "bubble-spark": BubbleChatSparkIcon,
  "ai": ArtificialIntelligence02Icon,
  "ai-magic": AiMagicIcon,
  "support": CustomerSupportIcon,
  "question": BubbleChatQuestionIcon,
  "chat": BubbleChatIcon,
}

// Default branding
const defaultBranding = {
  primary_color: "#0d9488",
  icon_id: "ai-brain",
  icon_style: "bulk" as const,
  logo_url: null as string | null,
}

type AgentBranding = typeof defaultBranding

// Loading fallback
function ChatLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex gap-1">
        <span className="size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
        <span className="size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
        <span className="size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}

// Chat content component der bruger useSearchParams
function WidgetChatContent() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agent")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [agentName, setAgentName] = useState("Assistent")
  const [branding, setBranding] = useState<AgentBranding>(defaultBranding)
  const [inputValue, setInputValue] = useState("")
  const [visitorId, setVisitorId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null

    const existingId = localStorage.getItem("easybot_visitor_id")
    if (existingId) {
      console.log("[Widget] Retrieved existing visitor ID:", existingId)
      return existingId
    }

    const newId = crypto.randomUUID()
    localStorage.setItem("easybot_visitor_id", newId)
    console.log("[Widget] Generated new visitor ID:", newId)
    return newId
  })
  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null

    const storedId = sessionStorage.getItem("easybot_conversation_id")
    if (storedId) {
      console.log("[Widget] Retrieved conversation ID from storage:", storedId)
      return storedId
    }

    return null
  })
  const [hasRated, setHasRated] = useState(false)
  const [showRatingFor, setShowRatingFor] = useState<string | null>(null)

  // Sørger for at visitor-id findes ved første render
  useEffect(() => {
    if (visitorId || typeof window === "undefined") return

    const existingId = localStorage.getItem("easybot_visitor_id")
    if (existingId) {
      setVisitorId(existingId)
      console.log("[Widget] Retrieved visitor ID after mount:", existingId)
      return
    }

    const newId = crypto.randomUUID()
    localStorage.setItem("easybot_visitor_id", newId)
    setVisitorId(newId)
    console.log("[Widget] Generated visitor ID after mount:", newId)
  }, [visitorId])

  useEffect(() => {
    if (!conversationId || typeof window === "undefined") return
    sessionStorage.setItem("easybot_conversation_id", conversationId)
  }, [conversationId])

  const transport = useMemo(() => {
    console.log('[Widget] Creating transport with:', { agentId, visitorId, conversationId })
    return new DefaultChatTransport({
      api: "/api/chat",
      body: { agentId, visitorId, conversationId },
    })
  }, [agentId, visitorId, conversationId])

  const { messages, sendMessage, status } = useChat({ transport })

  const isLoading = status === "submitted" || status === "streaming"

  // Gem samtale-id når første besked kommer
  useEffect(() => {
    if (messages.length > 0 && !conversationId && agentId) {
      // After first message, we need to get the conversation ID
      // For now, we'll fetch it from the API based on visitor ID
      const fetchConversationId = async () => {
        try {
          console.log('[Widget] Fetching conversation ID for agentId:', agentId, 'visitorId:', visitorId)
          const response = await fetch(`/api/conversations/latest?agentId=${agentId}&visitorId=${visitorId}`)
          const data = await response.json()
          console.log('[Widget] Received conversation data:', data)
          if (data.conversationId) {
            setConversationId(data.conversationId)
            sessionStorage.setItem('easybot_conversation_id', data.conversationId)
            console.log('[Widget] Saved conversation ID to state and storage:', data.conversationId)
          }
        } catch (error) {
          console.error('[Widget] Failed to fetch conversation ID:', error)
        }
      }
      fetchConversationId()
    }
  }, [messages, conversationId, agentId, visitorId])

  // Scroll til bunden ved nye beskeder
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Vis rating efter første svar fra assistent (med delay)
  useEffect(() => {
    if (hasRated || !conversationId) return

    const firstAssistantMessage = messages.find(m => m.role === "assistant")
    if (firstAssistantMessage && !showRatingFor && !isLoading) {
      // Wait 4 seconds before showing rating
      const timer = setTimeout(() => {
        setShowRatingFor(firstAssistantMessage.id)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [messages, hasRated, conversationId, showRatingFor, isLoading])

  // Hent agent info inkl. branding
  useEffect(() => {
    if (!agentId) return
    fetch(`/api/agents/${agentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.agent_name) setAgentName(data.agent_name)
        if (data.branding) {
          setBranding({
            primary_color: data.branding.primary_color || defaultBranding.primary_color,
            icon_id: data.branding.icon_id || defaultBranding.icon_id,
            icon_style: data.branding.icon_style || defaultBranding.icon_style,
            logo_url: data.branding.logo_url || null,
          })
        }
      })
      .catch(() => {})
  }, [agentId])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    
    const message = inputValue.trim()
    setInputValue("")
    await sendMessage({ text: message })
  }

  // Hent ikon component baseret på branding
  const IconComponent = iconComponents[branding.icon_id] || AiBrain01Icon

  // Generer en lysere version af primary color til baggrunde
  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16)
    const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent))
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent))
    const b = Math.min(255, Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent))
    return `rgb(${r}, ${g}, ${b})`
  }

  const primaryColor = branding.primary_color
  const lightColor = lightenColor(primaryColor, 0.85)

  if (!agentId) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-4">
        <p className="text-gray-500">Ingen agent konfigureret</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div
          className="flex size-10 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt={agentName}
              className="size-6 object-contain"
            />
          ) : (
            <HugeiconsIcon icon={IconComponent} size={20} />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{agentName}</p>
          <p className="text-xs text-gray-500">
            {isLoading ? "Skriver..." : "Online"}
          </p>
        </div>
      </div>

      {/* Beskeder */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className="mb-3 flex size-12 items-center justify-center rounded-full"
              style={{ backgroundColor: lightColor, color: primaryColor }}
            >
              <HugeiconsIcon icon={IconComponent} size={24} />
            </div>
            <p className="font-medium text-gray-900">Hej! 👋</p>
            <p className="mt-1 text-sm text-gray-500">
              Stil mig et spørgsmål, så hjælper jeg dig.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => {
            // Hent tekst fra message parts
            const textContent = message.parts
              ?.filter((part) => part.type === "text")
              .map((part) => (part as { type: "text"; text: string }).text)
              .join("") || ""

            return (
              <div key={message.id}>
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5"
                    style={
                      message.role === "user"
                        ? { backgroundColor: primaryColor, color: "white" }
                        : { backgroundColor: "#f3f4f6", color: "#111827" }
                    }
                  >
                    <p className="whitespace-pre-wrap text-sm">
                      {message.role === "assistant"
                        ? parseMessageContent(textContent, primaryColor)
                        : textContent}
                    </p>
                  </div>
                </div>
                {/* Show rating after first assistant message */}
                {message.role === "assistant" &&
                 showRatingFor === message.id &&
                 conversationId &&
                 !hasRated && (
                  <div className="mt-2">
                    <ConversationRating
                      conversationId={conversationId}
                      primaryColor={primaryColor}
                      onRated={() => setHasRated(true)}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-2.5">
                <div className="flex gap-1">
                  <span
                    className="size-2 animate-bounce rounded-full"
                    style={{ backgroundColor: primaryColor, animationDelay: "0ms" }}
                  />
                  <span
                    className="size-2 animate-bounce rounded-full"
                    style={{ backgroundColor: primaryColor, animationDelay: "150ms" }}
                  />
                  <span
                    className="size-2 animate-bounce rounded-full"
                    style={{ backgroundColor: primaryColor, animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="border-t p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Skriv en besked..."
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-colors focus:bg-white"
            style={{
              borderColor: inputValue ? primaryColor : undefined,
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex size-10 items-center justify-center rounded-full text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <HugeiconsIcon icon={SentIcon} size={18} />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          Powered by Easybot
        </p>
      </form>
    </div>
  )
}

// Page component med Suspense boundary
export default function WidgetChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <WidgetChatContent />
    </Suspense>
  )
}
