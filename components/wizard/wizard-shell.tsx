"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon, AiBrain01Icon, SparklesIcon } from "@hugeicons-pro/core-bulk-rounded"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export type WizardStep = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

type WizardShellProps = {
  steps: WizardStep[]
  currentStep: number
  onNext: () => void
  onBack: () => void
  onComplete: () => void
  canProceed: boolean
  isSubmitting?: boolean
  blockReason?: string | null
  children: React.ReactNode
}

export function WizardShell({
  steps,
  currentStep,
  onNext,
  onBack,
  onComplete,
  canProceed,
  isSubmitting = false,
  blockReason = null,
  children,
}: WizardShellProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="flex flex-1 flex-col bg-accent/30 p-4 lg:p-6">
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary w-fit">
            <HugeiconsIcon icon={SparklesIcon} size={14} />
            Opret din chatbot
          </div>
        </div>

        <Card className="overflow-hidden border-primary/10 pb-0">
          <div className="grid gap-0 lg:grid-cols-[1fr,260px]">
            <div className="flex flex-col border-b lg:border-b-0 lg:border-r">
              <div className="text-xs font-medium text-muted-foreground px-5 py-3 lg:px-6">
                  Trin {currentStep + 1} af {steps.length}
              </div>
              <div className="flex items-center gap-1.5 px-5 lg:px-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-1.5 p-5 pb-4 lg:p-6">
                <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
                  {steps[currentStep].title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="flex-1 px-5 pb-6 lg:px-6">{children}</div>

              <div className="mt-2 flex flex-col gap-2 border-t bg-muted/30 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    disabled={isFirstStep}
                  >
                    Tilbage
                  </Button>
                  {isLastStep ? (
                    <Button size="sm" onClick={onComplete} disabled={!canProceed || isSubmitting}>
                      {isSubmitting ? "Opretter..." : "Opret agent"}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={onNext} disabled={!canProceed}>
                      Fortsæt
                    </Button>
                  )}
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  {blockReason && !canProceed ? blockReason : "Alle felter ser fine ud"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
