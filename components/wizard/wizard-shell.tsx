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
  children: React.ReactNode
}

export function WizardShell({
  steps,
  currentStep,
  onNext,
  onBack,
  onComplete,
  canProceed,
  children,
}: WizardShellProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="flex flex-1 flex-col bg-accent/30 p-4 lg:p-6">
      <div className="mx-auto w-full max-w-5xl flex-1">
        {/* Header */}
        <div className="mb-4 flex flex-col items-center gap-2 text-center lg:mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <HugeiconsIcon icon={SparklesIcon} size={14} />
            Opret din chatbot
          </div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
            {steps[currentStep].title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr,240px] lg:gap-6">
          {/* Main content */}
          <Card className="flex flex-col overflow-hidden">
            <div className="flex-1 p-5 lg:p-6">
              {children}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3 lg:px-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                disabled={isFirstStep}
              >
                Tilbage
              </Button>
              <div className="text-xs text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </div>
              {isLastStep ? (
                <Button size="sm" onClick={onComplete} disabled={!canProceed}>
                  Opret agent
                </Button>
              ) : (
                <Button size="sm" onClick={onNext} disabled={!canProceed}>
                  Fortsæt
                </Button>
              )}
            </div>
          </Card>

          {/* Sidebar with stepper */}
          <Card className="hidden p-4 lg:block">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={AiBrain01Icon} size={16} />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Din agent</p>
                <p className="text-xs text-muted-foreground">Følg trinnene</p>
              </div>
            </div>

            <nav aria-label="Progress">
              <ol className="space-y-0.5">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep
                  const isCurrent = index === currentStep
                  const isFuture = index > currentStep

                  return (
                    <li key={step.id}>
                      <div
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                          isCurrent && "bg-primary/10"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            isCompleted && "bg-success text-white",
                            isCurrent && "bg-primary text-primary-foreground",
                            isFuture &&
                              "border-2 border-muted-foreground/20 text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <HugeiconsIcon icon={Tick02Icon} size={12} />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              isFuture && "text-muted-foreground"
                            )}
                          >
                            {step.title}
                          </p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="ml-5 h-1.5 border-l-2 border-dashed border-muted-foreground/20" />
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
          </Card>
        </div>

        {/* Mobile progress bar */}
        <div className="mt-4 lg:hidden">
          <div className="flex items-center gap-1.5">
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
        </div>
      </div>
    </div>
  )
}
