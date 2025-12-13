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
  MoreHorizontalIcon,
  Cancel01Icon,
  RefreshIcon,
} from "@hugeicons-pro/core-bulk-rounded"
import { ConversationRating } from "@/components/chat/conversation-rating"

// Markdown-parsing for bold text and links
function parseMessageContent(content: string, linkColor?: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  const regex = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match
  let keyIndex = 0

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      result.push(content.slice(lastIndex, match.index))
    }

    if (match[1]) {
      result.push(
        <strong key={keyIndex++} className="font-semibold">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
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

  if (lastIndex < content.length) {
    result.push(content.slice(lastIndex))
  }

  return result.length > 0 ? result : [content]
}

// Icon mapping based on branding icon_id
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

// Default suggestions (can be customized per agent in the future)
const defaultSuggestions = [
  "Hvad kan du hjælpe mig med?",
  "Hvordan kommer jeg i gang?",
  "Fortæl mig mere om jer",
]

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

// Chat content component
function WidgetChatContent() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agent")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [agentName, setAgentName] = useState("Assistent")
  const [branding, setBranding] = useState<AgentBranding>(defaultBranding)
  const [inputValue, setInputValue] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [visitorId, setVisitorId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null

    const existingId = localStorage.getItem("easybot_visitor_id")
    if (existingId) {
      return existingId
    }

    const newId = crypto.randomUUID()
    localStorage.setItem("easybot_visitor_id", newId)
    return newId
  })
  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null

    const storedId = sessionStorage.getItem("easybot_conversation_id")
    if (storedId) {
      return storedId
    }

    return null
  })
  const [hasRated, setHasRated] = useState(false)
  const [showRatingFor, setShowRatingFor] = useState<string | null>(null)

  // Ensure visitor-id exists on first render
  useEffect(() => {
    if (visitorId || typeof window === "undefined") return

    const existingId = localStorage.getItem("easybot_visitor_id")
    if (existingId) {
      setVisitorId(existingId)
      return
    }

    const newId = crypto.randomUUID()
    localStorage.setItem("easybot_visitor_id", newId)
    setVisitorId(newId)
  }, [visitorId])

  useEffect(() => {
    if (!conversationId || typeof window === "undefined") return
    sessionStorage.setItem("easybot_conversation_id", conversationId)
  }, [conversationId])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/chat",
      body: { agentId, visitorId, conversationId },
    })
  }, [agentId, visitorId, conversationId])

  const { messages, sendMessage, status, setMessages } = useChat({ transport })

  const isLoading = status === "submitted" || status === "streaming"

  // Save conversation-id when first message arrives
  useEffect(() => {
    if (messages.length > 0 && !conversationId && agentId) {
      const fetchConversationId = async () => {
        try {
          const response = await fetch(`/api/conversations/latest?agentId=${agentId}&visitorId=${visitorId}`)
          const data = await response.json()
          if (data.conversationId) {
            setConversationId(data.conversationId)
            sessionStorage.setItem('easybot_conversation_id', data.conversationId)
          }
        } catch (error) {
          console.error('[Widget] Failed to fetch conversation ID:', error)
        }
      }
      fetchConversationId()
    }
  }, [messages, conversationId, agentId, visitorId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Reset rating prompt when user types again
  useEffect(() => {
    if (hasRated) return
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "user" && showRatingFor) {
      setShowRatingFor(null)
    }
  }, [messages, hasRated, showRatingFor])

  // Show rating after latest assistant response (with delay)
  useEffect(() => {
    if (hasRated || !conversationId) return
    if (isLoading) return

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
    if (!lastAssistant) return
    if (showRatingFor === lastAssistant.id) return

    const timer = setTimeout(() => {
      setShowRatingFor(lastAssistant.id)
    }, 4000)

    return () => clearTimeout(timer)
  }, [messages, hasRated, conversationId, showRatingFor, isLoading])

  // Fetch agent info including branding
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

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return
    await sendMessage({ text: suggestion })
  }

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
    sessionStorage.removeItem('easybot_conversation_id')
    setHasRated(false)
    setShowRatingFor(null)
    setMenuOpen(false)
  }

  const handleEndChat = () => {
    // Send message to parent to close the widget
    window.parent.postMessage({ type: 'easybot-close' }, '*')
    setMenuOpen(false)
  }

  // Get icon component based on branding
  const IconComponent = iconComponents[branding.icon_id] || AiBrain01Icon

  const primaryColor = branding.primary_color

  if (!agentId) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-4">
        <p className="text-gray-500">Ingen agent konfigureret</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header with gradient */}
      <header
        className="relative flex items-center justify-between px-4 py-3 text-white"
        style={{
          background: `linear-gradient(0deg, rgba(255, 255, 255, 0) 29.14%, rgba(255, 255, 255, 0.16) 100%), ${primaryColor}`
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-sm">
            {branding.logo_url ? (
              <img
                src={branding.logo_url}
                alt={agentName}
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <HugeiconsIcon icon={IconComponent} size={22} color="white" />
            )}
          </div>
          <div>
            <h1 className="font-medium text-sm tracking-tight">{agentName}</h1>
            <p className="text-xs text-white/70">
              {isLoading ? "Skriver..." : "Online"}
            </p>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex size-9 items-center justify-center rounded-md opacity-90 transition-opacity hover:opacity-70"
            aria-label="Åbn menu"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} size={20} color="white" />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
              <button
                onClick={handleNewChat}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <HugeiconsIcon icon={RefreshIcon} size={16} />
                Ny samtale
              </button>
              <button
                onClick={handleEndChat}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
                Luk chat
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col p-4">
          {/* Welcome message - always shown at top */}
          {messages.length === 0 && (
            <div className="mb-4">
              <div className="flex flex-col gap-2">
                {/* First bubble with avatar */}
                <div className="max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-lg bg-white px-4 py-3 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="flex size-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {branding.logo_url ? (
                          <img
                            src={branding.logo_url}
                            alt={agentName}
                            className="size-6 rounded-full object-cover"
                          />
                        ) : (
                          <HugeiconsIcon icon={IconComponent} size={14} color="white" />
                        )}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: primaryColor }}
                      >
                        {agentName}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">
                      👋 Hej! Jeg er her for at hjælpe dig. Stil mig et spørgsmål!
                    </p>
                  </div>
                </div>
                {/* Second bubble */}
                <div className="max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm rounded-bl-lg bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm leading-relaxed text-gray-700">
                      Du kan vælge et af forslagene nedenfor, eller skrive din egen besked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-3">
            {messages.map((message) => {
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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "rounded-br-lg"
                          : "rounded-bl-lg bg-white shadow-sm"
                      }`}
                      style={
                        message.role === "user"
                          ? { backgroundColor: primaryColor, color: "white" }
                          : undefined
                      }
                    >
                      <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
                        message.role === "user" ? "" : "text-gray-700"
                      }`}>
                        {message.role === "assistant"
                          ? parseMessageContent(textContent, primaryColor)
                          : textContent}
                      </p>
                    </div>
                  </div>
                  {message.role === "assistant" &&
                   showRatingFor === message.id &&
                   conversationId &&
                   !hasRated && (
                    <div className="mt-2 flex justify-start">
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
                <div className="rounded-2xl rounded-bl-lg bg-white px-4 py-3 shadow-sm">
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

          {/* Suggestions - shown at bottom when no messages */}
          {messages.length === 0 && (
            <div className="mt-auto pt-4">
              <div className="flex flex-wrap justify-end gap-2">
                {defaultSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md disabled:opacity-50"
                    style={{
                      ["--hover-bg" as string]: primaryColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = primaryColor
                      e.currentTarget.style.color = "white"
                      e.currentTarget.style.borderColor = primaryColor
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white"
                      e.currentTarget.style.color = "#374151"
                      e.currentTarget.style.borderColor = "#e5e7eb"
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2">
        <p className="mb-2 text-center text-xs text-gray-400">
          Powered by Easybot
        </p>
        <form onSubmit={onSubmit}>
          <div
            className="flex items-center gap-2 rounded-2xl border-2 border-gray-100 bg-white px-3 py-2 transition-colors focus-within:border-gray-300"
            style={{
              borderColor: inputValue ? primaryColor : undefined,
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Skriv en besked..."
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
              style={{
                backgroundColor: inputValue.trim() ? primaryColor : "transparent",
                color: inputValue.trim() ? "white" : "#9ca3af"
              }}
            >
              <HugeiconsIcon icon={SentIcon} size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Page component with Suspense boundary
export default function WidgetChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <WidgetChatContent />
    </Suspense>
  )
}
