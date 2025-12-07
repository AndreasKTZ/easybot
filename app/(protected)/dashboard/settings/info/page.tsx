"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAgent } from "@/lib/agent-context"
import type { AgentScope } from "@/lib/supabase/types"

const scopeLabels: Record<AgentScope, string> = {
  products: "Produkter og services",
  subscriptions: "Abonnementer og priser",
  orders: "Ordrer",
  invoices: "Fakturaer og betaling",
  support: "Teknisk support",
  general: "Generelle spørgsmål",
}

const primaryRoleOptions = [
  { value: "customer-support", label: "Kundeservice" },
  { value: "sales", label: "Salg" },
  { value: "onboarding", label: "Onboarding" },
  { value: "technical-support", label: "Teknisk support" },
  { value: "general", label: "Generel assistent" },
]

const scopeOptions: AgentScope[] = [
  "products",
  "subscriptions",
  "orders",
  "invoices",
  "support",
  "general",
]

export default function InfoPage() {
  const { currentAgent, updateAgent } = useAgent()
  const [businessName, setBusinessName] = useState("")
  const [agentName, setAgentName] = useState("")
  const [primaryRole, setPrimaryRole] = useState("")
  const [scopes, setScopes] = useState<AgentScope[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync state med currentAgent når den ændres
  useEffect(() => {
    if (currentAgent) {
      setBusinessName(currentAgent.business_name)
      setAgentName(currentAgent.agent_name)
      setPrimaryRole(currentAgent.primary_role)
      setScopes(currentAgent.scopes)
    }
  }, [currentAgent])

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const toggleScope = (scope: AgentScope) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter((s) => s !== scope))
    } else {
      setScopes([...scopes, scope])
    }
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    
    try {
      await updateAgent(currentAgent.id, {
        businessName,
        agentName,
        primaryRole,
        scopes,
      })
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
        <h2 className="text-lg font-semibold">Grundlæggende info</h2>
        <p className="text-sm text-muted-foreground">
          Rediger grundlæggende oplysninger om din agent.
        </p>
      </div>

      <div className="space-y-6 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent-detaljer</CardTitle>
            <CardDescription>
              Navn og rolle for din chatbot-agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business-name">Virksomhedsnavn</Label>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agentnavn</Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary-role">Primær rolle</Label>
              <Select value={primaryRole} onValueChange={setPrimaryRole} disabled={saving}>
                <SelectTrigger id="primary-role">
                  <SelectValue placeholder="Vælg en rolle" />
                </SelectTrigger>
                <SelectContent>
                  {primaryRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hjælpeområder</CardTitle>
            <CardDescription>
              Vælg hvad din agent kan hjælpe med
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {scopeOptions.map((scope) => (
                <div
                  key={scope}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Checkbox
                    id={scope}
                    checked={scopes.includes(scope)}
                    onCheckedChange={() => toggleScope(scope)}
                    disabled={saving}
                  />
                  <Label htmlFor={scope} className="cursor-pointer flex-1">
                    {scopeLabels[scope]}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving || saved}>
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
