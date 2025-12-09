"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Building03Icon, AiBrain01Icon, Briefcase01Icon } from "@hugeicons-pro/core-bulk-rounded"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const primaryRoleOptions = [
  { value: "customer-support", label: "Kundeservice" },
  { value: "sales", label: "Salg" },
  { value: "onboarding", label: "Onboarding" },
  { value: "technical-support", label: "Teknisk support" },
  { value: "general", label: "Generel assistent" },
]

type BasicInfoStepProps = {
  businessName: string
  agentName: string
  primaryRole: string
  onBusinessNameChange: (value: string) => void
  onAgentNameChange: (value: string) => void
  onPrimaryRoleChange: (value: string) => void
}

export function BasicInfoStep({
  businessName,
  agentName,
  primaryRole,
  onBusinessNameChange,
  onAgentNameChange,
  onPrimaryRoleChange,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="business-name" className="flex items-center gap-1.5 text-sm">
            <HugeiconsIcon icon={Building03Icon} size={14} className="text-muted-foreground" />
            Virksomhedsnavn
          </Label>
          <Input
            id="business-name"
            placeholder="F.eks. TechShop ApS"
            value={businessName}
            onChange={(e) => onBusinessNameChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Brug det navn dine kunder kender – det vises i svarene.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="agent-name" className="flex items-center gap-1.5 text-sm">
            <HugeiconsIcon icon={AiBrain01Icon} size={14} className="text-muted-foreground" />
            Agentnavn
          </Label>
          <Input
            id="agent-name"
            placeholder="F.eks. Luna eller Max"
            value={agentName}
            onChange={(e) => onAgentNameChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Kort og personligt navn hjælper brugerne i gang.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary-role" className="flex items-center gap-1.5 text-sm">
            <HugeiconsIcon icon={Briefcase01Icon} size={14} className="text-muted-foreground" />
            Primær rolle
          </Label>
          <Select value={primaryRole} onValueChange={onPrimaryRoleChange}>
            <SelectTrigger id="primary-role">
              <SelectValue placeholder="Vælg rolle" />
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
      </div>

      {/* Preview */}
      {agentName && (
        <div className="rounded-xl border-2 border-dashed bg-muted/30 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preview
          </p>
          <div className="flex items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HugeiconsIcon icon={AiBrain01Icon} size={16} />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-background p-3 shadow-sm">
              <p className="text-sm">
                Hej! Jeg er <strong>{agentName}</strong>
                {businessName && (
                  <>
                    {" "}fra <strong>{businessName}</strong>
                  </>
                )}
                . Hvad kan jeg hjælpe dig med?
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
