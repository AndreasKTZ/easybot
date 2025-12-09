"use client"

import { useState } from "react"

interface ConversationRatingProps {
  conversationId: string
  onRated?: () => void
  primaryColor?: string
}

const EMOJI_RATINGS = [
  { value: 1, emoji: "😢", label: "Meget utilfreds" },
  { value: 2, emoji: "🙁", label: "Utilfreds" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Tilfreds" },
  { value: 5, emoji: "😄", label: "Meget tilfreds" },
]

export function ConversationRating({
  conversationId,
  onRated,
  primaryColor = "#0d9488",
}: ConversationRatingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const handleRating = async (rating: number) => {
    if (isSubmitting || isSubmitted) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/conversations/${conversationId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        onRated?.()
      }
    } catch (error) {
      console.error("Failed to submit rating:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex justify-start animate-in fade-in duration-300">
        <div className="rounded-2xl bg-gray-50 px-4 py-2.5 text-sm">
          <p className="text-gray-700">✓ Tak for din feedback!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start animate-in fade-in duration-500">
      <div className="rounded-2xl bg-gray-50 px-4 py-3">
        <p className="mb-2 text-xs text-gray-600">Hvordan var dette svar?</p>
        <div className="flex gap-2">
          {EMOJI_RATINGS.map((item) => (
            <button
              key={item.value}
              onClick={() => handleRating(item.value)}
              onMouseEnter={() => setHoveredRating(item.value)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled={isSubmitting}
              className="flex size-10 items-center justify-center rounded-lg text-2xl transition-all hover:scale-110 disabled:opacity-50"
              style={{
                backgroundColor: hoveredRating === item.value ? primaryColor + "20" : "transparent",
              }}
              title={item.label}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
