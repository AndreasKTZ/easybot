"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { File02Icon, Delete01Icon, Upload01Icon, FileEditIcon, Loading03Icon } from "@hugeicons-pro/core-bulk-rounded"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAgent } from "@/lib/agent-context"
import type { KnowledgeDocument } from "@/lib/supabase/types"
import { uploadDocument } from "@/lib/actions/documents"

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// Upload-trin til progress visning
type UploadStep = "idle" | "uploading" | "extracting" | "summarizing" | "done"

const UPLOAD_STEPS: Record<UploadStep, { progress: number; label: string }> = {
  idle: { progress: 0, label: "" },
  uploading: { progress: 20, label: "Uploader fil..." },
  extracting: { progress: 50, label: "Læser indhold..." },
  summarizing: { progress: 80, label: "Genererer opsummering med AI..." },
  done: { progress: 100, label: "Færdig!" },
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const { currentAgent } = useAgent()
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploading = uploadStep !== "idle"

  const fetchDocuments = useCallback(async () => {
    if (!currentAgent) return
    try {
      setLoading(true)
      const res = await fetch(`/api/agents/${currentAgent.id}/knowledge/documents`)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (err) {
      console.error("Kunne ikke hente dokumenter:", err)
    } finally {
      setLoading(false)
    }
  }, [currentAgent])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Filtypen understøttes ikke. Brug PDF eller TXT."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Filen er for stor (max 10 MB)"
    }
    return null
  }

  const uploadFile = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    try {
      // Start progress animation
      setUploadStep("uploading")

      // Brug server action til upload og AI-opsummering
      const formData = new FormData()
      formData.append("file", file)

      // Simuler progress trin (server action kører som én operation)
      setTimeout(() => setUploadStep("extracting"), 500)
      setTimeout(() => setUploadStep("summarizing"), 1500)

      const result = await uploadDocument(currentAgent.id, formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        setUploadStep("done")
        setDocuments([result.data, ...documents])
        toast.success("Dokument uploadet og opsummeret!")
      }
    } catch (err) {
      console.error("Kunne ikke uploade dokument:", err)
      toast.error("Kunne ikke uploade dokument")
    } finally {
      // Reset efter kort delay så brugeren ser "done" tilstand
      setTimeout(() => setUploadStep("idle"), 500)
    }
  }

  function getFileExtension(mimeType: string): string {
    const map: Record<string, string> = {
      "application/pdf": "PDF",
      "text/plain": "TXT",
    }
    return map[mimeType] || "FILE"
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeDocument = async (id: string) => {
    try {
      const res = await fetch(
        `/api/agents/${currentAgent.id}/knowledge/documents?documentId=${id}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        setDocuments(documents.filter((doc) => doc.id !== id))
        toast.success("Dokument fjernet")
      } else {
        toast.error("Kunne ikke fjerne dokument")
      }
    } catch (err) {
      console.error("Kunne ikke fjerne dokument:", err)
      toast.error("Kunne ikke fjerne dokument")
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dokumenter 📄
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload dokumenter som <span className="font-medium text-foreground">{currentAgent.agent_name}</span> kan bruge til at hjælpe dine kunder
        </p>
      </div>

      <div>
        <Card className="border">
          <CardContent className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <HugeiconsIcon icon={Loading03Icon} size={28} className="animate-spin text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">
                    {UPLOAD_STEPS[uploadStep].label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dette kan tage et øjeblik...
                  </p>
                </div>
                <div className="w-full max-w-xs space-y-2">
                  <Progress value={UPLOAD_STEPS[uploadStep].progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {UPLOAD_STEPS[uploadStep].progress}%
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${isDragging
                  ? "border-foreground/50 bg-muted/50"
                  : "border-border hover:border-foreground/30 hover:bg-muted/30"
                  }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <HugeiconsIcon icon={Upload01Icon} size={28} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">Upload dokumenter</p>
                  <p className="text-sm text-muted-foreground">
                    Træk og slip filer her, eller klik for at vælge
                  </p>
                </div>
                <Button size="lg">
                  <HugeiconsIcon icon={Upload01Icon} size={16} className="mr-2" />
                  Vælg filer
                </Button>
                <p className="text-xs text-muted-foreground">
                  PDF og tekstfiler (max 10 MB)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Uploadede dokumenter</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {documents.length} {documents.length === 1 ? "dokument" : "dokumenter"}
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
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon icon={FileEditIcon} size={24} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Ingen dokumenter endnu</p>
                <p className="text-sm text-muted-foreground">Upload dit første dokument ovenfor</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="transition-all hover:border-primary/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-5/10">
                    <HugeiconsIcon icon={File02Icon} size={20} className="text-chart-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.file_type} · {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={16} />
                    <span className="sr-only">Fjern dokument</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}