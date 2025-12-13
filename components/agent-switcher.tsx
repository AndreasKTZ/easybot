"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  ArrowDown01Icon,
  Add01Icon,
  AiBrain01Icon,
} from "@hugeicons-pro/core-stroke-rounded"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChevronsUpDown } from "lucide-react"
import { type Agent } from "@/lib/supabase/types"

type AgentSwitcherProps = {
  agents: Agent[]
  currentAgent: Agent | null
  onAgentChange: (agent: Agent | null) => void
}

export function AgentSwitcher({
  agents,
  currentAgent,
  onAgentChange,
}: AgentSwitcherProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg ">
                <HugeiconsIcon icon={AiBrain01Icon} size={16} />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 leading-none">
                {currentAgent ? (
                  <>
                    <span className="font-semibold">{currentAgent.agent_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {currentAgent.business_name}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-muted-foreground">
                    Vælg agent
                  </span>
                )}
              </div>
              <ChevronsUpDown />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            align="start"
          >
            {agents.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                onClick={() => onAgentChange(agent)}
                className="gap-2 py-2"
              >
                <div className="flex size-6 items-center justify-center rounded bg-muted text-primary">
                  <HugeiconsIcon icon={AiBrain01Icon} size={14} />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{agent.agent_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {agent.business_name}
                  </span>
                </div>
                {currentAgent?.id === agent.id && (
                  <HugeiconsIcon icon={Tick02Icon} size={16} className="text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            {agents.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem asChild>
              <Link href="/agents/new" className="gap-2 py-2">
                <div className="flex size-6 items-center justify-center rounded border border-dashed">
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                </div>
                <span>Opret ny agent</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
