"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package01Icon,
  Invoice01Icon,
  DeliveryTruck01Icon,
  CreditCardIcon,
  CustomerService01Icon,
  MessageQuestionIcon,
  Tick02Icon,
} from "@hugeicons-pro/core-bulk-rounded"
import { cn } from "@/lib/utils"
import { type AgentScope, scopeLabels } from "@/lib/mock-data"

const scopeConfig: {
  scope: AgentScope
  icon: typeof Package01Icon
  description: string
}[] = [
  {
    scope: "products",
    icon: Package01Icon,
    description: "Information om produkter, services og features",
  },
  {
    scope: "subscriptions",
    icon: Invoice01Icon,
    description: "Abonnementer, prisplaner og opgraderinger",
  },
  {
    scope: "orders",
    icon: DeliveryTruck01Icon,
    description: "Ordrestatus, forsendelse og leveringstider",
  },
  {
    scope: "invoices",
    icon: CreditCardIcon,
    description: "Generel hjælp til fakturaer og betalingsspørgsmål",
  },
  {
    scope: "support",
    icon: CustomerService01Icon,
    description: "Teknisk fejlsøgning og problemløsning",
  },
  {
    scope: "general",
    icon: MessageQuestionIcon,
    description: "Åbningstider, kontaktinfo og andre spørgsmål",
  },
]

type ScopesStepProps = {
  scopes: AgentScope[]
  onScopesChange: (scopes: AgentScope[]) => void
}

export function ScopesStep({ scopes, onScopesChange }: ScopesStepProps) {
  const toggleScope = (scope: AgentScope) => {
    if (scopes.includes(scope)) {
      onScopesChange(scopes.filter((s) => s !== scope))
    } else {
      onScopesChange([...scopes, scope])
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Vælg de områder din agent skal kunne hjælpe med. Du kan altid ændre det
        senere.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {scopeConfig.map(({ scope, icon, description }) => {
          const isSelected = scopes.includes(scope)
          return (
            <div
              key={scope}
              role="button"
              tabIndex={0}
              onClick={() => toggleScope(scope)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggleScope(scope)
                }
              }}
              className={cn(
                "group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/20 hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground group-hover:text-foreground"
                )}
              >
                <HugeiconsIcon icon={icon} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{scopeLabels[scope]}</span>
                  {isSelected && (
                    <HugeiconsIcon icon={Tick02Icon} size={16} className="ml-auto text-primary" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {scopes.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {scopes.length} område{scopes.length !== 1 && "r"} valgt
        </p>
      )}
    </div>
  )
}
