"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Book02Icon,
  ChartHistogramIcon,
  File02Icon,
  HelpCircleIcon,
  Home01Icon,
  Link01Icon,
  Message01Icon,
  Note01Icon,
  Settings01Icon,
  PaintBrushIcon,
} from "@hugeicons-pro/core-bulk-rounded"
import {
  Book02Icon as Book02IconSolid,
  ChartHistogramIcon as ChartHistogramIconSolid,
  File02Icon as File02IconSolid,
  HelpCircleIcon as HelpCircleIconSolid,
  Home01Icon as Home01IconSolid,
  Link01Icon as Link01IconSolid,
  Message01Icon as Message01IconSolid,
  Note01Icon as Note01IconSolid,
  Settings01Icon as Settings01IconSolid,
  PaintBrushIcon as PaintBrushIconSolid,
} from "@hugeicons-pro/core-solid-rounded"

import { AgentSwitcher } from "@/components/agent-switcher"
import { NavUser } from "@/components/nav-user"
import { useAgent } from "@/lib/agent-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Props = React.ComponentProps<typeof Sidebar> & {
  user: User
}

export function AppSidebar({ user, ...props }: Props) {
  const pathname = usePathname()
  const { agents, currentAgent, setCurrentAgent } = useAgent()
  const [comingSoonOpen, setComingSoonOpen] = React.useState(false)
  const [comingSoonTitle, setComingSoonTitle] = React.useState("")

  const overviewItems = [
    {
      title: "Oversigt",
      url: "/dashboard",
      icon: Home01Icon,
      iconSolid: Home01IconSolid,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: ChartHistogramIcon,
      iconSolid: ChartHistogramIconSolid,
    },
  ]

  const knowledgeItems = [
    {
      title: "Links",
      url: "/dashboard/knowledge/links",
      icon: Link01Icon,
      iconSolid: Link01IconSolid,
    },
    {
      title: "Dokumenter",
      url: "/dashboard/knowledge/documents",
      icon: File02Icon,
      iconSolid: File02IconSolid,
    },
    {
      title: "Tilpasset viden",
      url: "/dashboard/knowledge/custom",
      icon: Note01Icon,
      iconSolid: Note01IconSolid,
    },
  ]

  const settingsItems = [
    {
      title: "Tone og stemme",
      url: "/dashboard/settings/tone",
      icon: Message01Icon,
      iconSolid: Message01IconSolid,
    },
    {
      title: "Branding",
      url: "/dashboard/settings/branding",
      icon: PaintBrushIcon,
      iconSolid: PaintBrushIconSolid,
    },
    {
      title: "Grundinfo",
      url: "/dashboard/settings/info",
      icon: Book02Icon,
      iconSolid: Book02IconSolid,
    },
  ]

  const supportItems = [
    {
      title: "Hjælp",
      url: "#",
      icon: HelpCircleIcon,
      iconSolid: HelpCircleIconSolid,
    },
    {
      title: "Indstillinger",
      url: "#",
      icon: Settings01Icon,
      iconSolid: Settings01IconSolid,
    },
  ]

  // Brugerdata til NavUser
  const userData = {
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Bruger",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AgentSwitcher
          agents={agents}
          currentAgent={currentAgent}
          onAgentChange={setCurrentAgent}
        />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {/* Oversigt */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <HugeiconsIcon
                          icon={isActive ? item.iconSolid : item.icon}
                          size={18}
                        />
                        <span className="text-md">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Vidensbase */}
        <SidebarGroup>
          <SidebarGroupLabel>Vidensbase</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {knowledgeItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <HugeiconsIcon
                          icon={isActive ? item.iconSolid : item.icon}
                          size={18}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Indstillinger */}
        <SidebarGroup>
          <SidebarGroupLabel>Agent-indstillinger</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <HugeiconsIcon
                          icon={isActive ? item.iconSolid : item.icon}
                          size={18}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => {
                      setComingSoonTitle(item.title)
                      setComingSoonOpen(true)
                    }}
                  >
                    <HugeiconsIcon icon={item.icon} size={18} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={userData}
          onComingSoon={(title) => {
            setComingSoonTitle(title)
            setComingSoonOpen(true)
          }}
        />
      </SidebarFooter>

      {/* Coming Soon Dialog */}
      <AlertDialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{comingSoonTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              Denne side eksisterer ikke i dette studieprojekt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
