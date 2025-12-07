// Mock data til Easybot UI

export type AgentScope =
  | "products"
  | "subscriptions"
  | "orders"
  | "invoices"
  | "support"
  | "general"

export type AgentTone =
  | "friendly"
  | "professional"
  | "direct"
  | "educational"

export type KnowledgeLink = {
  id: string
  label: string
  url: string
}

export type KnowledgeDocument = {
  id: string
  name: string
  type: string
  size: string
}

export type Agent = {
  id: string
  businessName: string
  agentName: string
  primaryRole: string
  scopes: AgentScope[]
  tone: AgentTone
  knowledgeLinks: KnowledgeLink[]
  knowledgeDocuments: KnowledgeDocument[]
  createdAt: string
}

export const scopeLabels: Record<AgentScope, string> = {
  products: "Produkter og services",
  subscriptions: "Abonnementer og priser",
  orders: "Ordrer",
  invoices: "Fakturaer og betaling",
  support: "Teknisk support",
  general: "Generelle spørgsmål",
}

export const toneLabels: Record<AgentTone, string> = {
  friendly: "Venlig og uformel",
  professional: "Rolig og professionel",
  direct: "Kort og direkte",
  educational: "Forklarende og pædagogisk",
}

export const primaryRoleOptions = [
  { value: "customer-support", label: "Kundeservice" },
  { value: "sales", label: "Salg" },
  { value: "onboarding", label: "Onboarding" },
  { value: "technical-support", label: "Teknisk support" },
  { value: "general", label: "Generel assistent" },
]

export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    businessName: "TechShop ApS",
    agentName: "Tekla",
    primaryRole: "customer-support",
    scopes: ["products", "orders", "support", "general"],
    tone: "friendly",
    knowledgeLinks: [
      { id: "link-1", label: "Hjælpecenter", url: "https://techshop.dk/help" },
      { id: "link-2", label: "FAQ", url: "https://techshop.dk/faq" },
    ],
    knowledgeDocuments: [
      { id: "doc-1", name: "Produktkatalog.pdf", type: "PDF", size: "2.4 MB" },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "agent-2",
    businessName: "Fitness Pro",
    agentName: "Max",
    primaryRole: "sales",
    scopes: ["products", "subscriptions", "general"],
    tone: "professional",
    knowledgeLinks: [
      { id: "link-3", label: "Priser", url: "https://fitnesspro.dk/prices" },
    ],
    knowledgeDocuments: [],
    createdAt: "2024-02-20",
  },
]

