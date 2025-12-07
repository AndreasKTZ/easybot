"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Agent } from "@/lib/supabase/types"

type AgentContextType = {
  agents: Agent[]
  currentAgent: Agent | null
  setCurrentAgent: (agent: Agent | null) => void
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createAgent: (data: CreateAgentData) => Promise<Agent>
  updateAgent: (id: string, data: Partial<CreateAgentData>) => Promise<Agent>
  deleteAgent: (id: string) => Promise<void>
}

type CreateAgentData = {
  businessName: string
  agentName: string
  primaryRole: string
  scopes?: string[]
  tone?: string
  branding?: {
    primary_color: string
    icon_id: string
    icon_style: "bulk" | "solid"
    logo_url: string | null
  }
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/agents")
      
      if (!res.ok) {
        throw new Error("Kunne ikke hente agents")
      }
      
      const data = await res.json()
      setAgents(data)
      
      // Vælg første agent som standard hvis ingen er valgt
      if (data.length > 0 && !currentAgent) {
        setCurrentAgent(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukendt fejl")
    } finally {
      setLoading(false)
    }
  }, [currentAgent])

  useEffect(() => {
    fetchAgents()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const createAgent = async (data: CreateAgentData): Promise<Agent> => {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Kunne ikke oprette agent")
    }

    const newAgent = await res.json()
    setAgents((prev) => [newAgent, ...prev])
    setCurrentAgent(newAgent)
    return newAgent
  }

  const updateAgent = async (id: string, data: Partial<CreateAgentData>): Promise<Agent> => {
    const res = await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Kunne ikke opdatere agent")
    }

    const updatedAgent = await res.json()
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? updatedAgent : a))
    )
    if (currentAgent?.id === id) {
      setCurrentAgent(updatedAgent)
    }
    return updatedAgent
  }

  const deleteAgent = async (id: string): Promise<void> => {
    const res = await fetch(`/api/agents/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Kunne ikke slette agent")
    }

    setAgents((prev) => prev.filter((a) => a.id !== id))
    if (currentAgent?.id === id) {
      setCurrentAgent(agents.find((a) => a.id !== id) || null)
    }
  }

  return (
    <AgentContext.Provider
      value={{
        agents,
        currentAgent,
        setCurrentAgent,
        loading,
        error,
        refetch: fetchAgents,
        createAgent,
        updateAgent,
        deleteAgent,
      }}
    >
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider")
  }
  return context
}
