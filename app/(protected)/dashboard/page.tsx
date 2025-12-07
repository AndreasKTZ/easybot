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
import { Skeleton } from "@/components/ui/skeleton"
import { useAgent } from "@/lib/agent-context"
import { ChatWidget } from "@/components/chat-widget"

// Scope og tone labels
const scopeLabels: Record<string, string> = {
  products: "Produkter og services",
  subscriptions: "Abonnementer og priser",
  orders: "Ordrer",
  invoices: "Fakturaer og betaling",
  support: "Teknisk support",
  general: "Generelle spørgsmål",
}

const toneLabels: Record<string, string> = {
  friendly: "Venlig og uformel",
  professional: "Rolig og professionel",
  direct: "Kort og direkte",
  educational: "Forklarende og pædagogisk",
}

export default function DashboardPage() {
  const { currentAgent, loading } = useAgent()

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }

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
      description: "Administrer vidensbase-links",
      icon: Link01Icon,
      href: "/dashboard/knowledge/links",
    },
    {
      title: "Dokumenter",
      description: "Upload dokumenter",
      icon: File02Icon,
      href: "/dashboard/knowledge/documents",
    },
    {
      title: "Tone",
      description: toneLabels[currentAgent.tone] || "Ikke sat",
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
              {currentAgent.agent_name}
            </h2>
            <p className="text-muted-foreground">{currentAgent.business_name}</p>
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
                  {scopeLabels[scope] || scope}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Test chat */}
        <Card className="flex h-[500px] flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-0">
            <CardTitle className="text-base">Test din agent</CardTitle>
            <CardDescription>Prøv at chatte med {currentAgent.agent_name}</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <ChatWidget
              agentId={currentAgent.id}
              agentName={currentAgent.agent_name}
              className="min-h-0 flex-1"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
