"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SentIcon,
  AiBrain01Icon,
  ChatBotIcon,
  BubbleChatSparkIcon,
  ArtificialIntelligence02Icon,
  AiMagicIcon,
  CustomerSupportIcon,
  BubbleChatQuestionIcon,
  BubbleChatIcon,
  MoreHorizontalIcon,
  RefreshIcon,
} from "@hugeicons-pro/core-solid-rounded"
import { cn } from "@/lib/utils"

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

// Default suggestions
const defaultSuggestions = [
  "Hvor ser jeg jeres produkter?",
  "Hvordan kan du hjælpe?",
  "Kan man kontakte jer?",
  "Kan man bestille online?",
]

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

type AgentBranding = {
  primary_color: string
  icon_id: string
  icon_style: string
  logo_url: string | null
}

type ChatWidgetProps = {
  agentId: string
  agentName?: string
  className?: string
}

export function ChatWidget({ agentId, agentName = "Assistent", className }: ChatWidgetProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [branding, setBranding] = useState<AgentBranding>({
    primary_color: "#000000",
    icon_id: "ai-brain",
    icon_style: "bulk",
    logo_url: null,
  })

  // Fetch branding on mount
  useEffect(() => {
    if (!agentId) return
    fetch(`/api/agents/${agentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.branding) {
          setBranding({
            primary_color: data.branding.primary_color || "#000000",
            icon_id: data.branding.icon_id || "ai-brain",
            icon_style: data.branding.icon_style || "bulk",
            logo_url: data.branding.logo_url || null,
          })
        }
      })
      .catch(() => {})
  }, [agentId])

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) throw new Error("Chat request failed")

      // Stream response - parse AI SDK streaming format
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      const assistantId = `assistant-${Date.now()}`

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ])

      if (reader) {
        let buffer = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Parse lines from buffer
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue

            const jsonStr = line.slice(6)
            if (!jsonStr || jsonStr === "[DONE]") continue

            try {
              const data = JSON.parse(jsonStr)
              if (data.type === "text-delta" && data.delta) {
                assistantContent += data.delta
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  )
                )
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Beklager, der opstod en fejl. Prøv igen.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [agentId, isLoading, messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return
    sendMessage(suggestion)
  }

  const handleNewChat = () => {
    setMessages([])
    setMenuOpen(false)
  }

  const IconComponent = iconComponents[branding.icon_id] || AiBrain01Icon
  const primaryColor = branding.primary_color

  return (
    <div className={cn("flex flex-col overflow-hidden bg-gray-50", className)}>
      {/* Header with gradient */}
      <header
        className="relative flex shrink-0 items-center justify-between px-4 py-3 text-white"
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
            </div>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="flex min-h-full flex-col p-4">
          {/* Welcome message - shown when no messages */}
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
            {messages.map((message) => (
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
                        ? parseMessageContent(message.content, primaryColor)
                        : message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
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
              <div className="flex flex-row-reverse flex-wrap-reverse justify-start gap-2">
                {defaultSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md disabled:opacity-50"
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
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-4 pt-2">
        <form onSubmit={handleSubmit}>
          <div
            className="flex items-center gap-2 rounded-2xl border-2 border-gray-100 bg-white px-3 py-2 transition-colors focus-within:border-gray-300"
            style={{
              borderColor: input ? primaryColor : undefined,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv en besked..."
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
              style={{
                backgroundColor: input.trim() ? primaryColor : "transparent",
                color: input.trim() ? "white" : "#9ca3af"
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
