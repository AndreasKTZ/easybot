"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Link01Icon,
  Add01Icon,
  Delete01Icon,
  Upload01Icon,
  File02Icon,
  Globe02Icon,
  File01Icon,
} from "@hugeicons-pro/core-bulk-rounded"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Lokale typer til wizard (simplificeret version)
type WizardKnowledgeLink = {
  id: string
  label: string
  url: string
}

type WizardKnowledgeDocument = {
  id: string
  name: string
  type: string
  size: string
}

type KnowledgeStepProps = {
  links: WizardKnowledgeLink[]
  documents: WizardKnowledgeDocument[]
  onLinksChange: (links: WizardKnowledgeLink[]) => void
  onDocumentsChange: (documents: WizardKnowledgeDocument[]) => void
}

export function KnowledgeStep({
  links,
  documents,
  onLinksChange,
  onDocumentsChange,
}: KnowledgeStepProps) {
  const [newLinkLabel, setNewLinkLabel] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")

  const addLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return
    const newLink: WizardKnowledgeLink = {
      id: `link-${Date.now()}`,
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim(),
    }
    onLinksChange([...links, newLink])
    setNewLinkLabel("")
    setNewLinkUrl("")
  }

  const removeLink = (id: string) => {
    onLinksChange(links.filter((link) => link.id !== id))
  }

  const handleFakeUpload = () => {
    const fakeDoc: WizardKnowledgeDocument = {
      id: `doc-${Date.now()}`,
      name: `Dokument-${documents.length + 1}.pdf`,
      type: "PDF",
      size: "1.2 MB",
    }
    onDocumentsChange([...documents, fakeDoc])
  }

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="rounded-lg bg-primary/5 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Valgfrit:</strong> Tilføj
          ressourcer din agent kan bruge. Du kan springe dette over.
        </p>
      </div>

      {/* Links */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Globe02Icon} size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-medium">Links</h3>
        </div>

        {links.length > 0 && (
          <div className="space-y-1.5">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
              >
                <HugeiconsIcon icon={Link01Icon} size={14} className="shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{link.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {link.url}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => removeLink(link.id)}
                >
                  <HugeiconsIcon icon={Delete01Icon} size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="link-label" className="sr-only">
              Label
            </Label>
            <Input
              id="link-label"
              placeholder="Navn (f.eks. FAQ)"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="link-url" className="sr-only">
              URL
            </Label>
            <Input
              id="link-url"
              placeholder="https://..."
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLink()}
              className="h-8 text-sm"
            />
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={addLink}
            disabled={!newLinkLabel.trim() || !newLinkUrl.trim()}
          >
            <HugeiconsIcon icon={Add01Icon} size={16} />
          </Button>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={File01Icon} size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-medium">Dokumenter</h3>
        </div>

        {documents.length > 0 && (
          <div className="space-y-1.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
              >
                <HugeiconsIcon icon={File02Icon} size={14} className="shrink-0 text-chart-5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} · {doc.size}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => removeDocument(doc.id)}
                >
                  <HugeiconsIcon icon={Delete01Icon} size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          onClick={handleFakeUpload}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleFakeUpload()
            }
          }}
          className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed p-4 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
        >
          <HugeiconsIcon icon={Upload01Icon} size={20} />
          <span className="text-xs font-medium">
            Klik for at uploade
          </span>
          <span className="text-xs opacity-70">PDF, Word, TXT (max 10 MB)</span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Upload er kun visuelt i denne demo.
        </p>
      </div>
    </div>
  )
}
