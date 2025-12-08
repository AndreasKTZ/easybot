"use client"

import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon, Loading03Icon } from "@hugeicons-pro/core-bulk-rounded"
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

const toneLabels: Record<AgentTone, string> = {
  friendly: "Venlig og uformel",
  professional: "Rolig og professionel",
  direct: "Kort og direkte",
  educational: "Forklarende og pædagogisk",
}

const toneDescriptions: Record<AgentTone, string> = {
  friendly: "Afslappet og imødekommende. Bruger emoji og uformelt sprog.",
  professional: "Høflig og saglig. Holder en neutral og troværdig tone.",
  direct: "Kommer hurtigt til sagen. Korte, præcise svar uden fyld.",
  educational: "Forklarer tingene grundigt. God til komplekse emner.",
}

const toneExamples: Record<AgentTone, string> = {
  friendly: '"Hej! 👋 Hvad kan jeg hjælpe dig med i dag?"',
  professional: '"Goddag. Hvordan kan jeg være behjælpelig?"',
  direct: '"Hej. Hvad drejer det sig om?"',
  educational: '"Velkommen! Lad mig guide dig igennem dine muligheder."',
}

const toneOptions: AgentTone[] = ["friendly", "professional", "direct", "educational"]

export default function TonePage() {
  const { currentAgent, updateAgent } = useAgent()
  const [selectedTone, setSelectedTone] = useState<AgentTone>(
    currentAgent?.tone ?? "friendly"
  )
  const [saving, setSaving] = useState(false)

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

      <div className="grid gap-4 sm:grid-cols-2">
          {toneOptions.map((tone) => (
            <Card
              key={tone}
              className={cn(
                "cursor-pointer transition-all",
                selectedTone === tone 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                  : "hover:border-primary/30"
              )}
              onClick={() => setSelectedTone(tone)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    selectedTone === tone ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    <span className="text-lg">
                      {tone === "friendly" && "😊"}
                      {tone === "professional" && "👔"}
                      {tone === "direct" && "⚡"}
                      {tone === "educational" && "📚"}
                    </span>
                  </div>
                  {selectedTone === tone && (
                    <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={Tick02Icon} size={14} />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{toneLabels[tone]}</h3>
                <p className="text-sm text-muted-foreground mb-3">{toneDescriptions[tone]}</p>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm italic text-muted-foreground">
                    {toneExamples[tone]}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="border-dashed bg-muted/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <p className="font-semibold">Live preview</p>
                <p className="text-sm text-muted-foreground">Sådan vil {currentAgent.agent_name} svare</p>
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm">👤</div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2">
                    <p className="text-sm">Hvornår åbner I?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">🤖</div>
                  <div className="rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-2 max-w-[80%]">
                    <p className="text-sm">
                      {selectedTone === "friendly" &&
                        `Hej! 😊 Vi har åbent mandag til fredag kl. 9-17. Er der andet jeg kan hjælpe med?`}
                      {selectedTone === "professional" &&
                        `Vores åbningstider er mandag-fredag kl. 9:00-17:00. Du er velkommen til at kontakte os inden for disse tider.`}
                      {selectedTone === "direct" &&
                        `Man-fre, 9-17.`}
                      {selectedTone === "educational" &&
                        `Vi har åbent i hverdagene fra kl. 9 til 17. Det betyder at du kan nå os alle arbejdsdage. I weekenden er vi desværre lukket, men du kan skrive til os her, så svarer vi mandag morgen.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      <Button onClick={handleSave} disabled={saving} size="lg">
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
  )
}
