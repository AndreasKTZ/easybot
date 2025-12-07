"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { File02Icon, Delete01Icon, Upload01Icon, FileEditIcon } from "@hugeicons-pro/core-bulk-rounded"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAgent } from "@/lib/agent-context"
import { type KnowledgeDocument } from "@/lib/mock-data"

export default function DocumentsPage() {
  const { currentAgent } = useAgent()
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(
    currentAgent?.knowledgeDocuments ?? []
  )

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const handleFakeUpload = () => {
    const fakeDoc: KnowledgeDocument = {
      id: `doc-${Date.now()}`,
      name: `Dokument-${documents.length + 1}.pdf`,
      type: "PDF",
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
    }
    setDocuments([...documents, fakeDoc])
  }

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Dokumenter</h2>
        <p className="text-sm text-muted-foreground">
          Upload dokumenter som FAQ, produktlister, handelsbetingelser m.m.
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload dokument</CardTitle>
            <CardDescription>
              Understøtter PDF, Word og tekstfiler (max 10 MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-accent/50 cursor-pointer"
              onClick={handleFakeUpload}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <HugeiconsIcon icon={Upload01Icon} size={24} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Klik for at uploade</p>
                <p className="text-sm text-muted-foreground">
                  eller træk og slip filer her
                </p>
              </div>
              <Button variant="secondary">
                <HugeiconsIcon icon={Upload01Icon} size={16} className="mr-2" />
                Vælg filer
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Upload er kun visuelt i denne demo-version.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <h3 className="mb-4 font-medium">
          Uploadede dokumenter ({documents.length})
        </h3>
        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <HugeiconsIcon icon={FileEditIcon} size={32} className="text-muted-foreground" />
              <p className="text-muted-foreground">
                Ingen dokumenter uploadet endnu
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-5/10">
                    <HugeiconsIcon icon={File02Icon} size={20} className="text-chart-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} · {doc.size}
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
