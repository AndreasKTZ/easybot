"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartHistogramIcon,
  SourceCodeIcon,
  File02Icon,
  Link01Icon,
  Message01Icon,
  AiBrain01Icon,
  SentIcon,
} from "@hugeicons-pro/core-bulk-rounded"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAgent } from "@/lib/agent-context"
import { scopeLabels, toneLabels } from "@/lib/mock-data"

export default function DashboardPage() {
  const { currentAgent } = useAgent()

  if (!currentAgent) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
        <HugeiconsIcon icon={AiBrain01Icon} size={48} className="text-muted-foreground" />
        <p className="text-muted-foreground">Ingen agent valgt</p>
        <Button asChild>
          <Link href="/agents/new">Opret din første agent</Link>
        </Button>
      </div>
    )
  }

  const quickLinks = [
    {
      title: "Analytics",
      description: "Se statistik for din agent",
      icon: ChartHistogramIcon,
      href: "/dashboard/analytics",
    },
    {
      title: "Links",
      description: `${currentAgent.knowledgeLinks.length} links tilføjet`,
      icon: Link01Icon,
      href: "/dashboard/knowledge/links",
    },
    {
      title: "Dokumenter",
      description: `${currentAgent.knowledgeDocuments.length} dokumenter`,
      icon: File02Icon,
      href: "/dashboard/knowledge/documents",
    },
    {
      title: "Tone",
      description: toneLabels[currentAgent.tone],
      icon: Message01Icon,
      href: "/dashboard/settings/tone",
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
            <HugeiconsIcon icon={AiBrain01Icon} size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {currentAgent.agentName}
            </h2>
            <p className="text-muted-foreground">{currentAgent.businessName}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/agents/${currentAgent.id}/embed`}>
            <HugeiconsIcon icon={SourceCodeIcon} size={16} className="mr-2" />
            Hent embed-kode
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 px-4 lg:grid-cols-3 lg:px-6">
        {/* Quick links */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="font-medium">Genveje</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <HugeiconsIcon icon={link.icon} size={20} />
                </div>
                <div>
                  <p className="font-medium">{link.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Scopes */}
          <div className="mt-6">
            <h3 className="mb-3 font-medium">Hjælper med</h3>
            <div className="flex flex-wrap gap-2">
              {currentAgent.scopes.map((scope) => (
                <Badge key={scope} variant="secondary">
                  {scopeLabels[scope]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Test chat */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Test din agent</CardTitle>
            <CardDescription>Prøv at chatte (demo)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="flex-1 space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <HugeiconsIcon icon={AiBrain01Icon} size={14} className="text-primary" />
                </div>
                <div className="flex-1 rounded-lg bg-background p-2.5 text-sm shadow-sm">
                  Hej! Hvad kan jeg hjælpe dig med?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg bg-primary p-2.5 text-sm text-primary-foreground">
                  Hvad er jeres åbningstider?
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <HugeiconsIcon icon={AiBrain01Icon} size={14} className="text-primary" />
                </div>
                <div className="flex-1 rounded-lg bg-background p-2.5 text-sm shadow-sm">
                  Vi har åbent man-fre kl. 9-17.
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Skriv en besked..."
                className="flex-1 text-sm"
                disabled
              />
              <Button size="icon" variant="secondary" disabled>
                <HugeiconsIcon icon={SentIcon} size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
