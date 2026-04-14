import type { Campaign, CampaignObjective, CampaignStatus, CreativeClassification } from '.'

/* ═══ Objective Grouping ═══ */
export type ObjectiveGroup = 'leads' | 'sales' | 'traffic' | 'engagement'

export const OBJECTIVE_GROUP_MAP: Record<CampaignObjective, ObjectiveGroup> = {
  OUTCOME_LEADS: 'leads',
  OUTCOME_SALES: 'sales',
  CONVERSIONS: 'sales',
  OUTCOME_TRAFFIC: 'traffic',
  LINK_CLICKS: 'traffic',
  OUTCOME_ENGAGEMENT: 'engagement',
  OUTCOME_AWARENESS: 'engagement',
}

export const GROUP_CONFIG: Record<ObjectiveGroup, { label: string; icon: string; colorVar: string; description: string }> = {
  leads:      { label: 'Captacao de Leads', icon: 'Users',          colorVar: '--accent-green',  description: 'Campanhas focadas em gerar leads e mensagens' },
  sales:      { label: 'Vendas',            icon: 'ShoppingCart',   colorVar: '--accent-green',  description: 'Campanhas com objetivo de conversao e vendas' },
  traffic:    { label: 'Trafego',           icon: 'MousePointerClick', colorVar: '--accent-cyan', description: 'Campanhas de cliques e captacao de seguidores' },
  engagement: { label: 'Engajamento',       icon: 'Heart',          colorVar: '--accent-purple', description: 'Campanhas de engajamento e visualizacoes' },
}

/* ═══ Lookup maps (extracted from old Trafego.tsx) ═══ */
export const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  OUTCOME_TRAFFIC: 'Trafego',
  OUTCOME_ENGAGEMENT: 'Engajamento',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_SALES: 'Vendas',
  OUTCOME_AWARENESS: 'Alcance',
  LINK_CLICKS: 'Cliques',
  CONVERSIONS: 'Conversoes',
}

export const OBJECTIVE_COLORS: Record<CampaignObjective, string> = {
  OUTCOME_TRAFFIC: '--accent-cyan',
  OUTCOME_ENGAGEMENT: '--accent-purple',
  OUTCOME_LEADS: '--accent-green',
  OUTCOME_SALES: '--accent-green',
  OUTCOME_AWARENESS: '--accent-yellow',
  LINK_CLICKS: '--accent-cyan',
  CONVERSIONS: '--accent-green',
}

export const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Ativo', color: 'var(--accent-green)' },
  PAUSED: { label: 'Pausado', color: 'var(--accent-yellow)' },
  ARCHIVED: { label: 'Arquivado', color: 'var(--text-muted)' },
  DELETED: { label: 'Excluido', color: 'var(--text-ghost)' },
}

export const CLASSIFICATION_CONFIG: Record<CreativeClassification, { emoji: string; label: string; colorVar: string }> = {
  winner:   { emoji: '\u{1F3C6}', label: 'Winner',   colorVar: '--accent-green' },
  positive: { emoji: '\u2705',    label: 'Positivo',  colorVar: '--accent-green' },
  neutral:  { emoji: '\u26A0\uFE0F', label: 'Neutro', colorVar: '--accent-cyan' },
  negative: { emoji: '\u{1F534}', label: 'Negativo',  colorVar: '--accent-red' },
  fatigue:  { emoji: '\u{1F634}', label: 'Fadiga',    colorVar: '--accent-purple' },
}

/* ═══ Intelligence types ═══ */
export interface TrafficInsight {
  id: string
  group: ObjectiveGroup | 'general'
  type: 'positive' | 'warning' | 'danger' | 'info'
  title: string
  description: string
  metric?: { label: string; value: string }
  priority: number
}

/* ═══ Helpers ═══ */
export const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const fmtNum = (v: number) => v.toLocaleString('pt-BR')

export const fmtPct = (v: number) => v.toFixed(2) + '%'

export function ctrColor(ctr: number): string {
  if (ctr > 2) return 'var(--accent-green)'
  if (ctr >= 1) return 'var(--accent-yellow)'
  return 'var(--accent-red)'
}

type SortDir = 'asc' | 'desc'
export type { SortDir }

export function sortBy<T>(arr: T[], key: keyof T, dir: SortDir): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (typeof av === 'number' && typeof bv === 'number') {
      return dir === 'asc' ? av - bv : bv - av
    }
    return dir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })
}

export function groupCampaigns(campaigns: Campaign[]): Record<ObjectiveGroup, Campaign[]> {
  const groups: Record<ObjectiveGroup, Campaign[]> = { leads: [], sales: [], traffic: [], engagement: [] }
  for (const c of campaigns) {
    const g = OBJECTIVE_GROUP_MAP[c.objective]
    if (g) groups[g].push(c)
  }
  return groups
}
