"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons-pro/core-bulk-rounded"
import { Tick02Icon } from "@hugeicons-pro/core-solid-rounded"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAgent } from "@/lib/agent-context"
import type { AgentTone } from "@/lib/supabase/types"

const toneOptions: {
  id: AgentTone
  emoji: string
  label: string
  description: string
  example: string
}[] = [
    {
      id: "friendly",
      emoji: "😊",
      label: "Venlig og uformel",
      description: "Afslappet og imødekommende. Bruger emoji og uformelt sprog.",
      example: "Hej! 👋 Hvad kan jeg hjælpe dig med i dag?",
    },
    {
      id: "professional",
      emoji: "👔",
      label: "Rolig og professionel",
      description: "Høflig og saglig. Holder en neutral og troværdig tone.",
      example: "Goddag. Hvordan kan jeg være behjælpelig?",
    },
    {
      id: "direct",
      emoji: "⚡",
      label: "Kort og direkte",
      description: "Kommer hurtigt til sagen. Korte, præcise svar uden fyld.",
      example: "Hej. Hvad drejer det sig om?",
    },
    {
      id: "educational",
      emoji: "📚",
      label: "Forklarende og pædagogisk",
      description: "Forklarer tingene grundigt. God til komplekse emner.",
      example: "Velkommen! Lad mig guide dig igennem dine muligheder.",
    },
  ]

const previewResponses: Record<AgentTone, string> = {
  friendly: "Hej! 😊 Vi har åbent mandag til fredag kl. 9-17. Er der andet jeg kan hjælpe med?",
  professional: "Vores åbningstider er mandag-fredag kl. 9:00-17:00. Du er velkommen til at kontakte os inden for disse tider.",
  direct: "Man-fre, 9-17.",
  educational: "Vi har åbent i hverdagene fra kl. 9 til 17. Det betyder at du kan nå os alle arbejdsdage. I weekenden er vi desværre lukket, men du kan skrive til os her, så svarer vi mandag morgen.",
}

export default function TonePage() {
  const { currentAgent, updateAgent } = useAgent()
  const [selectedTone, setSelectedTone] = useState<AgentTone>(
    currentAgent?.tone ?? "friendly"
  )
  const [saving, setSaving] = useState(false)

  // Sync with currentAgent when it changes
  useEffect(() => {
    if (currentAgent?.tone) {
      setSelectedTone(currentAgent.tone)
    }
  }, [currentAgent])

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)

    try {
      await updateAgent(currentAgent.id, { tone: selectedTone })
      toast.success("Tone gemt!")
    } catch (err) {
      console.error("Kunne ikke gemme:", err)
      toast.error("Kunne ikke gemme tonen")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Tone og stemme 🎭
        </h1>
        <p className="text-muted-foreground mt-1">
          Vælg hvordan <span className="font-medium text-foreground">{currentAgent.agent_name}</span> skal kommunikere med dine kunder
        </p>
      </div>

      <div className="space-y-6">
        {/* Tone selection */}
        <Card>
          <CardHeader>
            <CardTitle>Kommunikationsstil</CardTitle>
            <CardDescription>
              Vælg den tone der passer bedst til dit brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {toneOptions.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSelectedTone(tone.id)}
                  className={cn(
                    "group flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/50",
                    selectedTone === tone.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/30"
                  )}
                >
                  <div className="flex w-full items-start justify-between">
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-xl transition-colors",
                        selectedTone === tone.id
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <span className="text-xl">{tone.emoji}</span>
                    </div>
                    {selectedTone === tone.id && (
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                        <HugeiconsIcon icon={Tick02Icon} size={14} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{tone.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {tone.description}
                    </p>
                  </div>
                  <div className="w-full rounded-lg bg-background border px-3 py-2">
                    <p className="text-sm italic text-muted-foreground">
                      "{tone.example}"
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>
              Sådan vil {currentAgent.agent_name} svare på et spørgsmål
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="space-y-4">
                {/* User message */}
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm">
                    👤
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                    <p className="text-sm">Hvornår åbner I?</p>
                  </div>
                </div>
                {/* Agent response */}
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm">
                    🤖
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-background border px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm">{previewResponses[selectedTone]}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <HugeiconsIcon icon={Loading03Icon} size={16} className="mr-2 animate-spin" />
              Gemmer...
            </>
          ) : (
            "Gem ændringer"
          )}
        </Button>
      </div>
    </div>
  )
}
