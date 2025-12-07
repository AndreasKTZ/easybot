"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Copy01Icon, Tick02Icon } from "@hugeicons-pro/core-bulk-rounded"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAgent } from "@/lib/agent-context"

export default function EmbedPage() {
  const { currentAgent } = useAgent()
  const [copied, setCopied] = useState(false)

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const embedCode = `<script src="${siteUrl}/widget.js?agent=${currentAgent.id}"></script>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href="/dashboard">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-2" />
            Tilbage til oversigt
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Embed din chatbot
            </h2>
            <p className="text-muted-foreground">
              Kopiér koden nedenfor og indsæt den på din hjemmeside.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Embed-kode</CardTitle>
              <CardDescription>
                Indsæt denne linje i din HTML – f.eks. før {`</body>`}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-2"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <HugeiconsIcon icon={Tick02Icon} size={16} className="mr-1" />
                      Kopieret!
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Copy01Icon} size={16} className="mr-1" />
                      Kopiér
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg border border-dashed p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Når koden er indsat korrekt, vil
                  chatbotten automatisk vises som en widget i nederste højre
                  hjørne af din side.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Sådan vil widgetten se ud på din side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 overflow-hidden rounded-lg border bg-muted/30">
                {/* Simuleret browser */}
                <div className="absolute inset-x-0 top-0 flex items-center gap-2 border-b bg-background px-3 py-2">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-destructive/60" />
                    <div className="size-3 rounded-full bg-warning/60" />
                    <div className="size-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                    dinvirksomhed.dk
                  </div>
                </div>

                {/* Placeholder content */}
                <div className="absolute inset-0 top-10 p-4">
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 rounded bg-muted-foreground/20" />
                    <div className="h-3 w-1/2 rounded bg-muted-foreground/20" />
                    <div className="h-3 w-2/3 rounded bg-muted-foreground/20" />
                  </div>
                </div>

                {/* Chat widget preview */}
                <div className="absolute bottom-4 right-4 flex size-14 items-center justify-center rounded-full bg-primary shadow-lg">
                  <svg
                    className="size-6 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <a
                    href={`${siteUrl}/widget/chat?agent=${currentAgent.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Åbn chat i nyt vindue
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
