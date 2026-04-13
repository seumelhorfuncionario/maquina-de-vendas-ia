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

export type LeadChannel = 'whatsapp' | 'instagram' | 'web'

export interface Lead {
  id: string
  name: string
  phone: string
  product: string
  origin: string
  channel: LeadChannel
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

// --- Traffic Dashboard Types ---
export type CampaignObjective = 'OUTCOME_TRAFFIC' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_LEADS' | 'OUTCOME_SALES' | 'OUTCOME_AWARENESS' | 'LINK_CLICKS' | 'CONVERSIONS'
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED'

export interface Campaign {
  id: string
  campaignId: string
  campaignName: string
  objective: CampaignObjective
  status: CampaignStatus
  spend: number
  revenue: number
  purchases: number
  impressions: number
  clicks: number
  leads: number
  cpm: number
  cpc: number
  ctr: number
  roas: number
  linkClicks: number
  videoViews: number
  engagement: number
  messagingReplies: number
  costPerResult: number
  date: string
}

export type CreativeClassification = 'winner' | 'positive' | 'neutral' | 'negative' | 'fatigue'

export interface CreativePerformance {
  id: string
  creativeId: string
  creativeName: string
  campaignId: string | null
  adSetName: string | null
  spend: number
  revenue: number
  purchases: number
  impressions: number
  clicks: number
  roas: number
  ctr: number
  cpc: number
  classification: CreativeClassification
  thumbnailUrl: string | null
  date: string
}

export interface TrafficAlert {
  id: string
  type: 'low_roas' | 'cpm_spike' | 'fatigue' | 'high_cpc' | 'low_ctr'
  severity: 'warning' | 'danger'
  title: string
  description: string
  campaignName?: string
  value?: number
}

export interface TrafficComparison {
  metric: string
  label: string
  today: number
  yesterday: number
  last7d: number
  todayVsYesterday: number
  todayVsLast7d: number
  format: 'currency' | 'number' | 'percent' | 'multiplier'
}

// --- Content Calendar Types ---
export type ContentType = 'image' | 'video' | 'carousel' | 'story' | 'reel'
export type ContentPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin'
export type ContentStatus = 'draft' | 'review' | 'approved' | 'published'

export interface ContentPost {
  id: string
  title: string
  contentType: ContentType
  caption: string | null
  mediaUrl: string | null
  thumbnailUrl: string | null
  platform: ContentPlatform
  status: ContentStatus
  scheduledDate: string | null
  publishedAt: string | null
  approvedAt: string | null
  notes: string | null
  tags: string[] | null
  createdAt: string
}
