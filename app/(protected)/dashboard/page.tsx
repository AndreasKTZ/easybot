"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartHistogramIcon,
  SourceCodeIcon,
  File02Icon,
  Link01Icon,
  Message01Icon,
  AiBrain01Icon,
  TestTube01Icon,
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
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || 
                    user?.email?.split("@")[0] || 
                    "der"

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
    <div className="flex min-h-full">
      {/* Left side - Main content (65%) */}
      <div className="flex-1 p-6 lg:p-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Hej, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Du ser oversigten for <span className="font-medium text-foreground">{currentAgent.agent_name}</span>
          </p>
        </div>

        {/* Embed CTA Card */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <HugeiconsIcon icon={SourceCodeIcon} size={24} />
              </div>
              <div>
                <p className="font-semibold">Tilføj til din hjemmeside</p>
                <p className="text-sm text-muted-foreground">
                  Kopier embed-koden og indsæt den på dit website
                </p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href={`/agents/${currentAgent.id}/embed`}>
                Hent embed-kode
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Genveje</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="h-full transition-all hover:border-primary/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
                      <HugeiconsIcon icon={link.icon} size={24} />
                    </div>
                    <div>
                      <p className="font-semibold">{link.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Scopes */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Hjælper med</h3>
          <div className="flex flex-wrap gap-2">
            {currentAgent.scopes.map((scope) => (
              <Badge key={scope} variant="secondary">
                {scopeLabels[scope] || scope}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Testing zone (35%) */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[500px] flex-col border-l-2 border-dashed border-border bg-muted/40">
        {/* Testing zone header */}
        <div className="flex items-center gap-3 p-5 border-b border-dashed border-border">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={TestTube01Icon} size={20} />
          </div>
          <div>
            <p className="font-semibold">Testområde</p>
            <p className="text-xs text-muted-foreground">Prøv en samtale med din agent</p>
          </div>
        </div>

        {/* Chat widget */}
        <div className="flex-1 flex flex-col min-h-0 p-4">
          <Card className="flex flex-1 flex-col overflow-hidden">
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

      {/* Mobile: Show chat in a card below */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button size="lg" className="rounded-full shadow-lg h-14 w-14" asChild>
          <Link href={`/widget/chat?agent=${currentAgent.id}`}>
            <HugeiconsIcon icon={AiBrain01Icon} size={24} />
          </Link>
        </Button>
      </div>
    </div>
  )
}
