"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  Message01Icon,
  SmileIcon,
  Clock01Icon,
  UserGroupIcon,
} from "@hugeicons-pro/core-bulk-rounded"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAgent } from "@/lib/agent-context"

// Mock analytics data
const mockStats = {
  conversations: { value: 847, change: 12.5, trend: "up" as const },
  satisfaction: { value: 94, change: 2.3, trend: "up" as const },
  avgResponseTime: { value: 1.2, change: -15, trend: "up" as const },
  uniqueUsers: { value: 312, change: 8.7, trend: "up" as const },
}

const mockWeeklyData = [
  { day: "Man", conversations: 120 },
  { day: "Tir", conversations: 145 },
  { day: "Ons", conversations: 132 },
  { day: "Tor", conversations: 158 },
  { day: "Fre", conversations: 142 },
  { day: "Lør", conversations: 85 },
  { day: "Søn", conversations: 65 },
]

const mockTopQuestions = [
  { question: "Hvad er jeres åbningstider?", count: 89 },
  { question: "Hvordan returnerer jeg en vare?", count: 67 },
  { question: "Hvad koster fragt?", count: 54 },
  { question: "Hvor lang er leveringstiden?", count: 48 },
  { question: "Kan jeg ændre min ordre?", count: 41 },
]

export default function AnalyticsPage() {
  const { currentAgent } = useAgent()

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Samtaler",
      value: mockStats.conversations.value.toLocaleString("da-DK"),
      change: mockStats.conversations.change,
      trend: mockStats.conversations.trend,
      icon: Message01Icon,
      description: "Denne måned",
    },
    {
      title: "Tilfredshed",
      value: `${mockStats.satisfaction.value}%`,
      change: mockStats.satisfaction.change,
      trend: mockStats.satisfaction.trend,
      icon: SmileIcon,
      description: "Gennemsnitlig rating",
    },
    {
      title: "Svartid",
      value: `${mockStats.avgResponseTime.value}s`,
      change: mockStats.avgResponseTime.change,
      trend: mockStats.avgResponseTime.trend,
      icon: Clock01Icon,
      description: "Gennemsnitlig",
    },
    {
      title: "Unikke brugere",
      value: mockStats.uniqueUsers.value.toLocaleString("da-DK"),
      change: mockStats.uniqueUsers.change,
      trend: mockStats.uniqueUsers.trend,
      icon: UserGroupIcon,
      description: "Denne måned",
    },
  ]

  const maxConversations = Math.max(...mockWeeklyData.map((d) => d.conversations))

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">
          Analytics for {currentAgent.agentName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Se hvordan din agent performer
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <HugeiconsIcon icon={stat.icon} size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <HugeiconsIcon icon={ArrowUp01Icon} size={12} className="text-success" />
                ) : (
                  <HugeiconsIcon icon={ArrowDown01Icon} size={12} className="text-destructive" />
                )}
                <span
                  className={
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  }
                >
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-muted-foreground">fra sidste måned</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 px-4 lg:grid-cols-2 lg:px-6">
        {/* Weekly chart */}
        <Card>
          <CardHeader>
            <CardTitle>Samtaler denne uge</CardTitle>
            <CardDescription>Antal samtaler per dag</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-2">
              {mockWeeklyData.map((day) => (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
                    style={{
                      height: `${(day.conversations / maxConversations) * 100}%`,
                      minHeight: "8px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top questions */}
        <Card>
          <CardHeader>
            <CardTitle>Mest stillede spørgsmål</CardTitle>
            <CardDescription>Top 5 denne måned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopQuestions.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{item.question}</p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <div className="px-4 lg:px-6">
        <p className="text-center text-xs text-muted-foreground">
          Analytics er demo-data. Rigtig tracking kommer når agenten er live.
        </p>
      </div>
    </div>
  )
}
