"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Building03Icon,
  CheckListIcon,
  Message01Icon,
  BookOpen02Icon,
} from "@hugeicons-pro/core-bulk-rounded"
import { WizardShell, type WizardStep } from "@/components/wizard/wizard-shell"
import { BasicInfoStep } from "@/components/wizard/basic-info-step"
import { ScopesStep } from "@/components/wizard/scopes-step"
import { ToneStep } from "@/components/wizard/tone-step"
import { KnowledgeStep } from "@/components/wizard/knowledge-step"
import {
  type AgentScope,
  type AgentTone,
  type KnowledgeLink,
  type KnowledgeDocument,
} from "@/lib/mock-data"

const wizardSteps: WizardStep[] = [
  {
    id: "basic-info",
    title: "Grundlæggende info",
    description: "Giv din agent et navn og fortæl os om din virksomhed.",
    icon: <HugeiconsIcon icon={Building03Icon} size={20} />,
  },
  {
    id: "scopes",
    title: "Hjælpeområder",
    description: "Hvad skal din agent kunne hjælpe dine kunder med?",
    icon: <HugeiconsIcon icon={CheckListIcon} size={20} />,
  },
  {
    id: "tone",
    title: "Tone og stemme",
    description: "Vælg en kommunikationsstil der passer til dit brand.",
    icon: <HugeiconsIcon icon={Message01Icon} size={20} />,
  },
  {
    id: "knowledge",
    title: "Vidensbase",
    description: "Tilføj ressourcer som din agent kan bruge til at svare.",
    icon: <HugeiconsIcon icon={BookOpen02Icon} size={20} />,
  },
]

export default function NewAgentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  // Form state
  const [businessName, setBusinessName] = useState("")
  const [agentName, setAgentName] = useState("")
  const [primaryRole, setPrimaryRole] = useState("")
  const [scopes, setScopes] = useState<AgentScope[]>([])
  const [tone, setTone] = useState<AgentTone | "">("")
  const [links, setLinks] = useState<KnowledgeLink[]>([])
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return businessName.trim() && agentName.trim() && primaryRole
      case 1:
        return scopes.length > 0
      case 2:
        return tone !== ""
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    router.push("/dashboard")
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            businessName={businessName}
            agentName={agentName}
            primaryRole={primaryRole}
            onBusinessNameChange={setBusinessName}
            onAgentNameChange={setAgentName}
            onPrimaryRoleChange={setPrimaryRole}
          />
        )
      case 1:
        return <ScopesStep scopes={scopes} onScopesChange={setScopes} />
      case 2:
        return <ToneStep tone={tone} onToneChange={(t) => setTone(t)} />
      case 3:
        return (
          <KnowledgeStep
            links={links}
            documents={documents}
            onLinksChange={setLinks}
            onDocumentsChange={setDocuments}
          />
        )
      default:
        return null
    }
  }

  return (
    <WizardShell
      steps={wizardSteps}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onComplete={handleComplete}
      canProceed={canProceed()}
    >
      {renderStep()}
    </WizardShell>
  )
}
