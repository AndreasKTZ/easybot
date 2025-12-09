"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  Message01Icon,
  SmileIcon,
  MessageMultiple01Icon,
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

type Period = "today" | "week" | "month"

type AnalyticsData = {
  stats: {
    conversations: { value: number; change: number; trend: "up" | "down" }
    satisfaction: { value: number; change: number; trend: "up" | "down" }
    avgConversationLength: { value: number; change: number; trend: "up" | "down" }
    uniqueUsers: { value: number; change: number; trend: "up" | "down" }
  }
  weeklyData: Array<{ day: string; conversations: number }>
  topQuestions: Array<{ question: string; count: number }>
}

export default function AnalyticsPage() {
  const { currentAgent } = useAgent()
  const [period, setPeriod] = useState<Period>("month")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentAgent) return

    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/agents/${currentAgent.id}/analytics?period=${period}`)
        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [currentAgent, period])

  if (!currentAgent) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-muted-foreground">Ingen agent valgt</p>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="flex gap-1">
          <span className="size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
          <span className="size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
          <span className="size-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Samtaler",
      value: data.stats.conversations.value.toLocaleString("da-DK"),
      change: data.stats.conversations.change,
      trend: data.stats.conversations.trend,
      icon: Message01Icon,
      description: period === "today" ? "I dag" : period === "week" ? "Denne uge" : "Denne måned",
    },
    {
      title: "Tilfredshed",
      value: `${data.stats.satisfaction.value}%`,
      change: data.stats.satisfaction.change,
      trend: data.stats.satisfaction.trend,
      icon: SmileIcon,
      description: "Gennemsnitlig rating",
    },
    {
      title: "Samtaleløngde",
      value: `${data.stats.avgConversationLength.value}`,
      change: data.stats.avgConversationLength.change,
      trend: data.stats.avgConversationLength.trend,
      icon: MessageMultiple01Icon,
      description: "Gennemsnitlig antal beskeder",
    },
    {
      title: "Unikke brugere",
      value: data.stats.uniqueUsers.value.toLocaleString("da-DK"),
      change: data.stats.uniqueUsers.change,
      trend: data.stats.uniqueUsers.trend,
      icon: UserGroupIcon,
      description: period === "today" ? "I dag" : period === "week" ? "Denne uge" : "Denne måned",
    },
  ]

  const maxConversations = Math.max(...data.weeklyData.map((d) => d.conversations), 1)

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics 📊</h1>
        <p className="text-muted-foreground mt-1">
          Se hvordan <span className="font-medium text-foreground">{currentAgent.agent_name}</span> performer
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod("today")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            period === "today"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          I dag
        </button>
        <button
          onClick={() => setPeriod("week")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            period === "week"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Denne uge
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            period === "month"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Denne måned
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className={index === 0 ? "border-primary/20 bg-primary/5" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${
                    index === 0 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  <HugeiconsIcon icon={stat.icon} size={20} />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === "up" ? (
                    <HugeiconsIcon icon={ArrowUp01Icon} size={12} className="text-success" />
                  ) : (
                    <HugeiconsIcon icon={ArrowDown01Icon} size={12} className="text-destructive" />
                  )}
                  <span className={stat.trend === "up" ? "text-success font-medium" : "text-destructive font-medium"}>
                    {Math.abs(stat.change)}%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly chart */}
        <Card>
          <CardHeader>
            <CardTitle>Samtaler {period === "week" ? "denne uge" : "sidste 7 dage"}</CardTitle>
            <CardDescription>Antal samtaler per dag</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-2">
              {data.weeklyData.map((day) => (
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
            <CardDescription>
              Top 5 {period === "today" ? "i dag" : period === "week" ? "denne uge" : "denne måned"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topQuestions.length > 0 ? (
              <div className="space-y-4">
                {data.topQuestions.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">{item.question}</p>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-muted-foreground">Ingen spørgsmål endnu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
