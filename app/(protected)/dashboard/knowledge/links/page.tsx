"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link01Icon, Add01Icon, Delete01Icon, LinkSquare02Icon } from "@hugeicons-pro/core-bulk-rounded"
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
import { useAgent } from "@/lib/agent-context"
import { type KnowledgeLink } from "@/lib/mock-data"

export default function LinksPage() {
  const { currentAgent } = useAgent()
  const [links, setLinks] = useState<KnowledgeLink[]>(
    currentAgent?.knowledgeLinks ?? []
  )
  const [newLabel, setNewLabel] = useState("")
  const [newUrl, setNewUrl] = useState("")

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return
    const newLink: KnowledgeLink = {
      id: `link-${Date.now()}`,
      label: newLabel.trim(),
      url: newUrl.trim(),
    }
    setLinks([...links, newLink])
    setNewLabel("")
    setNewUrl("")
  }

  const removeLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Links</h2>
        <p className="text-sm text-muted-foreground">
          Tilføj links til hjælpesider, FAQ, prislister og andet som din agent
          kan referere til.
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Tilføj nyt link</CardTitle>
            <CardDescription>
              Angiv et navn og URL til den side du vil tilføje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="link-label">Navn</Label>
                <Input
                  id="link-label"
                  placeholder="F.eks. FAQ eller Prisliste"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={addLink}
                  disabled={!newLabel.trim() || !newUrl.trim()}
                >
                  <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
                  Tilføj
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <h3 className="mb-4 font-medium">
          Tilføjede links ({links.length})
        </h3>
        {links.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <HugeiconsIcon icon={Link01Icon} size={32} className="text-muted-foreground" />
              <p className="text-muted-foreground">Ingen links tilføjet endnu</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <Card key={link.id}>
                <CardContent className="flex items-center gap-4 py-4">
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
