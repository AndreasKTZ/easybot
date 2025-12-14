"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Note01Icon, Delete01Icon, PencilEdit01Icon, Loading03Icon } from "@hugeicons-pro/core-bulk-rounded"
import { Add01Icon } from "@hugeicons-pro/core-solid-rounded"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAgent } from "@/lib/agent-context"
import type { KnowledgeCustom } from "@/lib/supabase/types"

export default function CustomPage() {
  const { currentAgent } = useAgent()
  const [entries, setEntries] = useState<KnowledgeCustom[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")

  // Dialog state for editing
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<KnowledgeCustom | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [updating, setUpdating] = useState(false)

  const fetchEntries = useCallback(async () => {
    if (!currentAgent) return
    try {
      setLoading(true)
      const res = await fetch(`/api/agents/${currentAgent.id}/knowledge/custom`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch (err) {
      console.error("Kunne ikke hente entries:", err)
    } finally {
      setLoading(false)
    }
  }, [currentAgent])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const addEntry = async () => {
    if (!newTitle.trim() || !newContent.trim() || saving) return

    setSaving(true)
    try {
      const res = await fetch(`/api/agents/${currentAgent.id}/knowledge/custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
      })

      if (res.ok) {
        const newEntry = await res.json()
        setEntries([newEntry, ...entries])
        setNewTitle("")
        setNewContent("")
        toast.success("Information tilføjet!")
      } else {
        toast.error("Kunne ikke tilføje information")
      }
    } catch (err) {
      console.error("Kunne ikke tilføje information:", err)
      toast.error("Kunne ikke tilføje information")
    } finally {
      setSaving(false)
    }
  }

  const removeEntry = async (id: string) => {
    try {
      const res = await fetch(
        `/api/agents/${currentAgent.id}/knowledge/custom?entryId=${id}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        setEntries(entries.filter((entry) => entry.id !== id))
        toast.success("Information fjernet")
      } else {
        toast.error("Kunne ikke fjerne information")
      }
    } catch (err) {
      console.error("Kunne ikke fjerne information:", err)
      toast.error("Kunne ikke fjerne information")
    }
  }

  const openEditDialog = (entry: KnowledgeCustom) => {
    setEditingEntry(entry)
    setEditTitle(entry.title)
    setEditContent(entry.content)
    setEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setEditDialogOpen(false)
    setEditingEntry(null)
    setEditTitle("")
    setEditContent("")
  }

  const updateEntry = async () => {
    if (!editingEntry || !editTitle.trim() || !editContent.trim() || updating) return

    setUpdating(true)
    try {
      const res = await fetch(
        `/api/agents/${currentAgent.id}/knowledge/custom?entryId=${editingEntry.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
        }
      )

      if (res.ok) {
        const updatedEntry = await res.json()
        setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)))
        closeEditDialog()
        toast.success("Information opdateret!")
      } else {
        toast.error("Kunne ikke opdatere information")
      }
    } catch (err) {
      console.error("Kunne ikke opdatere information:", err)
      toast.error("Kunne ikke opdatere information")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tilpasset viden 📝</h1>
        <p className="text-muted-foreground mt-1">
          Tilføj brugerdefineret information som{" "}
          <span className="font-medium text-foreground">{currentAgent.agent_name}</span>{" "}
          kan bruge til at besvare spørgsmål
        </p>
      </div>

      {/* Add new entry form */}
      <div>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Add01Icon} size={20} />
              </div>
              <div>
                <p className="font-semibold">Tilføj ny information</p>
                <p className="text-sm text-muted-foreground">Angiv en titel og indhold</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry-title">Titel</Label>
                <Input
                  id="entry-title"
                  className="bg-background"
                  placeholder="F.eks. Returpolitik eller Åbningstider"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-content">Indhold</Label>
                <Textarea
                  id="entry-content"
                  className="min-h-[120px] bg-background"
                  placeholder="Skriv information som agenten kan bruge..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={addEntry}
                  disabled={!newTitle.trim() || !newContent.trim() || saving}
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

      {/* List of entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tilføjet information</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {entries.length} {entries.length === 1 ? "indlæg" : "indlæg"}
          </span>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex items-start gap-4 py-4">
                  <Skeleton className="size-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon icon={Note01Icon} size={24} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Ingen information endnu</p>
                <p className="text-sm text-muted-foreground">
                  Tilføj din første brugerdefinerede information ovenfor
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card key={entry.id} className="transition-all hover:border-primary/30">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={Note01Icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {entry.content}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(entry)}
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                      <span className="sr-only">Rediger</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={16} />
                      <span className="sr-only">Fjern</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger information</DialogTitle>
            <DialogDescription>
              Opdater titel og indhold for denne information
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={updating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Indhold</Label>
              <Textarea
                id="edit-content"
                className="min-h-[160px]"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={updating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={updating}>
              Annuller
            </Button>
            <Button
              onClick={updateEntry}
              disabled={!editTitle.trim() || !editContent.trim() || updating}
            >
              {updating ? (
                <HugeiconsIcon icon={Loading03Icon} size={16} className="mr-2 animate-spin" />
              ) : null}
              Gem ændringer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
