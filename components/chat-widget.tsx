"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon, UserIcon, AiBrain01Icon } from "@hugeicons-pro/core-bulk-rounded"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

type ChatWidgetProps = {
  agentId: string
  agentName?: string
  className?: string
}

export function ChatWidget({ agentId, agentName = "Assistent", className }: ChatWidgetProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Auto-scroll til bunden når nye beskeder kommer
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

      // Stream response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      const assistantId = `assistant-${Date.now()}`

      // Tilføj tom assistent besked
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          assistantContent += chunk
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantContent } : m
            )
          )
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

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b p-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <HugeiconsIcon icon={AiBrain01Icon} size={20} />
        </div>
        <div>
          <p className="font-medium">{agentName}</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <p>Start en samtale med {agentName}</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                message.role === "user"
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground"
              )}
            >
              <HugeiconsIcon
                icon={message.role === "user" ? UserIcon : AiBrain01Icon}
                size={16}
              />
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HugeiconsIcon icon={AiBrain01Icon} size={16} />
            </div>
            <div className="rounded-2xl bg-muted px-4 py-2">
              <div className="flex gap-1">
                <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Skriv en besked..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <HugeiconsIcon icon={SentIcon} size={18} />
          </Button>
        </div>
      </form>
    </div>
  )
}
