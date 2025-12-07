"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { SourceCodeIcon } from "@hugeicons-pro/core-bulk-rounded"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAgent } from "@/lib/agent-context"

const pageTitles: Record<string, string> = {
  "/dashboard": "Oversigt",
  "/dashboard/analytics": "Analytics",
  "/dashboard/knowledge/links": "Links",
  "/dashboard/knowledge/documents": "Dokumenter",
  "/dashboard/settings/tone": "Tone og stemme",
  "/dashboard/settings/branding": "Branding",
  "/dashboard/settings/info": "Grundinfo",
  "/agents/new": "Opret ny agent",
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) {
    return pageTitles[pathname]
  }

  if (pathname.match(/^\/agents\/[^/]+\/embed$/)) {
    return "Embed-kode"
  }

  if (pathname.match(/^\/agents\/[^/]+$/)) {
    return "Agent detaljer"
  }

  return "Easybot"
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const { currentAgent } = useAgent()

  const showEmbedButton = pathname.startsWith("/dashboard") && currentAgent

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        {showEmbedButton && (
          <div className="ml-auto">
            <Button asChild variant="outline" size="sm">
              <Link href={`/agents/${currentAgent.id}/embed`}>
                <HugeiconsIcon icon={SourceCodeIcon} size={16} className="mr-1.5" />
                Embed-kode
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
