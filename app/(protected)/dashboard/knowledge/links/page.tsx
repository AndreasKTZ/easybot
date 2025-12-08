"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link01Icon, Add01Icon, Delete01Icon, LinkSquare02Icon, Loading03Icon } from "@hugeicons-pro/core-bulk-rounded"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useAgent } from "@/lib/agent-context"
import type { KnowledgeLink } from "@/lib/supabase/types"

export default function LinksPage() {
  const { currentAgent } = useAgent()
  const [links, setLinks] = useState<KnowledgeLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newUrl, setNewUrl] = useState("")

  const fetchLinks = useCallback(async () => {
    if (!currentAgent) return
    try {
      setLoading(true)
      const res = await fetch(`/api/agents/${currentAgent.id}/knowledge/links`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data)
      }
    } catch (err) {
      console.error("Kunne ikke hente links:", err)
    } finally {
      setLoading(false)
    }
  }, [currentAgent])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const addLink = async () => {
    if (!newLabel.trim() || !newUrl.trim() || saving) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/agents/${currentAgent.id}/knowledge/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim(), url: newUrl.trim() }),
      })

      if (res.ok) {
        const newLink = await res.json()
        setLinks([newLink, ...links])
        setNewLabel("")
        setNewUrl("")
        toast.success("Link tilføjet!")
      } else {
        toast.error("Kunne ikke tilføje link")
      }
    } catch (err) {
      console.error("Kunne ikke tilføje link:", err)
      toast.error("Kunne ikke tilføje link")
    } finally {
      setSaving(false)
    }
  }

  const removeLink = async (id: string) => {
    try {
      const res = await fetch(
        `/api/agents/${currentAgent.id}/knowledge/links?linkId=${id}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        setLinks(links.filter((link) => link.id !== id))
        toast.success("Link fjernet")
      } else {
        toast.error("Kunne ikke fjerne link")
      }
    } catch (err) {
      console.error("Kunne ikke fjerne link:", err)
      toast.error("Kunne ikke fjerne link")
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Links 🔗
        </h1>
        <p className="text-muted-foreground mt-1">
          Tilføj links til hjælpesider, FAQ og prislister som <span className="font-medium text-foreground">{currentAgent.agent_name}</span> kan referere til
        </p>
      </div>

      <div>
        <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HugeiconsIcon icon={Add01Icon} size={20} />
            </div>
            <div>
              <p className="font-semibold">Tilføj nyt link</p>
              <p className="text-sm text-muted-foreground">Angiv et navn og URL</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="link-label">Navn</Label>
              <Input
                id="link-label"
                className="bg-background"
                placeholder="F.eks. FAQ eller Prisliste"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                className="bg-background"
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addLink}
                disabled={!newLabel.trim() || !newUrl.trim() || saving}
                size="lg"
              >
                {saving ? (
                  <HugeiconsIcon icon={Loading03Icon} size={16} className="mr-2 animate-spin" />
                ) : (
                  <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
                )}
                Tilføj
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tilføjede links</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {links.length} {links.length === 1 ? "link" : "links"}
          </span>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 py-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : links.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon icon={Link01Icon} size={24} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Ingen links endnu</p>
                <p className="text-sm text-muted-foreground">Tilføj dit første link ovenfor</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <Card key={link.id} className="transition-all hover:border-primary/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={Link01Icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{link.label}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {link.url}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
                        <span className="sr-only">Åbn link</span>
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(link.id)}
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={16} />
                      <span className="sr-only">Fjern link</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
