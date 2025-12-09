"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons-pro/core-bulk-rounded"
import { cn } from "@/lib/utils"
import type { AgentTone } from "@/lib/supabase/types"

const toneLabels: Record<AgentTone, string> = {
  friendly: "Venlig og uformel",
  professional: "Rolig og professionel",
  direct: "Kort og direkte",
  educational: "Forklarende og pædagogisk",
}

const toneConfig: {
  tone: AgentTone
  emoji: string
  description: string
  example: string
}[] = [
  {
    tone: "friendly",
    emoji: "😊",
    description: "Afslappet og imødekommende",
    example: "Hej! 👋 Hvad kan jeg hjælpe dig med i dag?",
  },
  {
    tone: "professional",
    emoji: "👔",
    description: "Høflig og saglig",
    example: "Goddag. Hvordan kan jeg være behjælpelig?",
  },
  {
    tone: "direct",
    emoji: "⚡",
    description: "Kort og præcist",
    example: "Hej. Hvad drejer det sig om?",
  },
  {
    tone: "educational",
    emoji: "📚",
    description: "Forklarende og pædagogisk",
    example: "Velkommen! Lad mig guide dig igennem.",
  },
]

type ToneStepProps = {
  tone: AgentTone | ""
  onToneChange: (tone: AgentTone) => void
}

export function ToneStep({ tone, onToneChange }: ToneStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Vælg den tone der bedst matcher dit brand. Du kan altid finjustere senere.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {toneConfig.map((option) => {
          const isSelected = tone === option.tone
          return (
            <div
              key={option.tone}
              role="button"
              tabIndex={0}
              onClick={() => onToneChange(option.tone)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onToneChange(option.tone)
                }
              }}
              className={cn(
                "group relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/20 hover:bg-muted"
              )}
            >
              {isSelected && (
                <div className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={Tick02Icon} size={12} />
                </div>
              )}
              <span className="text-xl">{option.emoji}</span>
              <span className="mt-1.5 font-medium text-sm">{toneLabels[option.tone]}</span>
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
              <div className="mt-3 rounded-lg bg-background px-3 py-2 text-xs italic text-muted-foreground shadow-sm">
                &ldquo;{option.example}&rdquo;
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
