"use client"

import type { User } from "@supabase/supabase-js"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AgentProvider } from "@/lib/agent-context"

type Props = {
  children: React.ReactNode
  user: User
}

export function ProtectedLayoutClient({ children, user }: Props) {
  return (
    <AgentProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={user} />
        <main className="flex flex-1 flex-col">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </main>
      </SidebarProvider>
    </AgentProvider>
  )
}

