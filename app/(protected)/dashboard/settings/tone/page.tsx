"use client"

import { useState } from "react"
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
  const [saved, setSaved] = useState(false)

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
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error("Kunne ikke gemme:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Tone og stemme</h2>
        <p className="text-sm text-muted-foreground">
          Vælg hvordan {currentAgent.agent_name} skal kommunikere med dine kunder.
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {toneOptions.map((tone) => (
            <Card
              key={tone}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                selectedTone === tone && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setSelectedTone(tone)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{toneLabels[tone]}</CardTitle>
                  {selectedTone === tone && (
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={Tick02Icon} size={12} />
                    </div>
                  )}
                </div>
                <CardDescription>{toneDescriptions[tone]}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic text-muted-foreground">
                  {toneExamples[tone]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Sådan vil {currentAgent.agent_name} svare med den valgte tone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Kunde: &quot;Hvornår åbner I?&quot;
                </p>
                <p className="text-sm">
                  {selectedTone === "friendly" &&
                    `${currentAgent.agent_name}: "Hej! 😊 Vi har åbent mandag til fredag kl. 9-17. Er der andet jeg kan hjælpe med?"`}
                  {selectedTone === "professional" &&
                    `${currentAgent.agent_name}: "Vores åbningstider er mandag-fredag kl. 9:00-17:00. Du er velkommen til at kontakte os inden for disse tider."`}
                  {selectedTone === "direct" &&
                    `${currentAgent.agent_name}: "Man-fre, 9-17."`}
                  {selectedTone === "educational" &&
                    `${currentAgent.agent_name}: "Vi har åbent i hverdagene fra kl. 9 til 17. Det betyder at du kan nå os alle arbejdsdage. I weekenden er vi desværre lukket, men du kan skrive til os her, så svarer vi mandag morgen."`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="px-4 lg:px-6">
        <Button onClick={handleSave} disabled={saving || saved} size="lg">
          {saving ? (
            <>
              <HugeiconsIcon icon={Loading03Icon} size={16} className="mr-2 animate-spin" />
              Gemmer...
            </>
          ) : saved ? (
            <>
              <HugeiconsIcon icon={Tick02Icon} size={16} className="mr-2" />
              Gemt!
            </>
          ) : (
            "Gem ændringer"
          )}
        </Button>
        </div>
    </div>
  )
}
