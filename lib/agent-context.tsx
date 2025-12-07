"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { type Agent, mockAgents } from "@/lib/mock-data"

type AgentContextType = {
  agents: Agent[]
  currentAgent: Agent | null
  setCurrentAgent: (agent: Agent) => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents] = useState<Agent[]>(mockAgents)
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null)

  // Vælg første agent som standard
  useEffect(() => {
    if (agents.length > 0 && !currentAgent) {
      setCurrentAgent(agents[0])
    }
  }, [agents, currentAgent])

  return (
    <AgentContext.Provider value={{ agents, currentAgent, setCurrentAgent }}>
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

