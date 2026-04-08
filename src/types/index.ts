export interface User {
  id: string
  name: string
  email: string
  company: string
  avatar?: string
}

export type LeadStatus = string

export interface KanbanAgent {
  id: number
  name: string
  avatar_url?: string
}

export interface KanbanOffer {
  id: number
  description: string
  value: string
  currency: string
}

export interface KanbanNote {
  id: string
  text: string
  created_at?: string
}

export interface KanbanData {
  item_id: number
  funnel_name: string
  status: 'open' | 'won' | 'lost'
  priority: string
  value: number
  assigned_agents: KanbanAgent[]
  offers: KanbanOffer[]
  notes: KanbanNote[]
  deadline_at?: string
  scheduled_at?: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  product: string
  origin: string
  status: LeadStatus
  createdAt: string
  value?: number
  kanbanItemId?: string
  kanban?: KanbanData
}

export interface Product {
  id: string
  name: string
  size: string
  price: number
  cost: number
  margin: number
  image?: string
}

export interface Sale {
  id: string
  clientName: string
  product: string
  quantity: number
  unitPrice: number
  total: number
  date: string
}

export type ProductionStatus = 'pending' | 'producing' | 'done' | 'delivered'

export interface ProductionOrder {
  id: string
  clientName: string
  product: string
  quantity: number
  status: ProductionStatus
  createdAt: string
}

export interface FinancialSummary {
  revenue: number
  trafficCost: number
  materialCost: number
  profit: number
}

export interface DashboardMetrics {
  leadsToday: number
  leadsMonth: number
  conversions: number
  conversionRate: number
  revenue: number
  trafficCost: number
  materialCost: number
  profit: number
  machineActive: boolean
}

export interface ChartData {
  name: string
  vendas: number
  leads: number
  receita: number
}
