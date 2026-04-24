import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { Loader2, Megaphone, LayoutGrid, Users, ShoppingCart, MousePointerClick, Heart, RefreshCw, MessageCircle, Calendar, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import PageHeader from '@/components/PageHeader'
import { mockCampaigns, mockCreatives } from '@/data/mockTraffic'
import { useTrafficData } from '@/hooks/useTrafficData'
import { useTrafficIntelligence } from '@/hooks/useTrafficIntelligence'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useReportMetrics } from '@/hooks/useReportMetrics'
import { useClientId } from '@/hooks/useClientId'
import { supabase } from '@/integrations/supabase/client'
import { mockDashboard } from '@/data/mock'
import TrafficOverview from '@/components/traffic/TrafficOverview'
import TrafficLeads from '@/components/traffic/TrafficLeads'
import TrafficSales from '@/components/traffic/TrafficSales'
import TrafficTraffic from '@/components/traffic/TrafficTraffic'
import TrafficEngagement from '@/components/traffic/TrafficEngagement'
import TrafficDateFilter, { getDefaultDateRange, type DateRange } from '@/components/traffic/TrafficDateFilter'
import { type ObjectiveGroup, groupCampaigns, GROUP_CONFIG, OBJECTIVE_GROUP_MAP } from '@/types/traffic'
import type { Campaign, CreativePerformance } from '@/types'

function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('pt-BR')
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`
}

// Identifica campanhas de WhatsApp leads no Meta: OUTCOME_ENGAGEMENT/MESSAGES com sinais
// de CTA de conversa (nome com [LEAD][WhatsApp], ou messaging_replies > 0).
function isWhatsAppLeadCampaign(c: Campaign): boolean {
  const name = (c.campaignName || '').toLowerCase()
  const obj = String(c.objective || '')
  const objHint = obj === 'OUTCOME_ENGAGEMENT' || obj === 'MESSAGES' || obj === 'OUTCOME_MESSAGES'
  const nameHint = name.includes('whatsapp') || name.includes('wpp') || (name.includes('lead') && objHint)
  return (c.messagingReplies ?? 0) > 0 || (objHint && nameHint)
}

type TabKey = 'overview' | ObjectiveGroup

const TAB_ICONS: Record<TabKey, typeof LayoutGrid> = {
  overview: LayoutGrid,
  leads: Users,
  sales: ShoppingCart,
  traffic: MousePointerClick,
  engagement: Heart,
}

export default function Trafego() {
  const { isDemo, isSuperAdmin } = useAuth()
  const { clientId } = useClientId()
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange)
  const hook = useTrafficData(dateRange.from, dateRange.to)
  const dashboardData = useDashboardMetrics()

  // Cruzamento com agendamentos (usa client-reports do Agent System). Date range do traffic
  // (strings YYYY-MM-DD) vira Date pro useReportMetrics.
  const reportRange = useMemo(() => ({
    from: new Date(dateRange.from + 'T00:00:00'),
    to: new Date(dateRange.to + 'T23:59:59'),
    label: dateRange.label,
  }), [dateRange])
  const report = useReportMetrics(reportRange)

  // Foco de campanhas marcado pelo super admin (whatsapp_leads, web_leads, sales, traffic, engagement).
  const [focuses, setFocuses] = useState<string[]>([])
  useEffect(() => {
    if (!clientId || isDemo) { setFocuses([]); return }
    let cancelled = false
    supabase
      .from('clients')
      .select('meta_campaign_focuses')
      .eq('id', clientId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setFocuses(((data as any)?.meta_campaign_focuses as string[]) ?? [])
      })
    return () => { cancelled = true }
  }, [clientId, isDemo])

  // Sync manual (super admin only) — invoca sync-meta-ads com lookback 90d.
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const handleSync = async () => {
    if (!clientId || syncing) return
    setSyncing(true)
    setSyncMsg(null)
    try {
      const { data, error } = await supabase.functions.invoke('sync-meta-ads', {
        body: { client_id: clientId, lookback_days: 90 },
      })
      if (error) throw error
      const result = (data as any)?.results?.[0]
      setSyncMsg(result ? `✅ ${result.rows_written} linhas sincronizadas (${result.campaigns} campanhas)` : '✅ Sync concluído')
      hook.refetch?.()
    } catch (e) {
      setSyncMsg(`❌ ${(e as Error).message || 'Erro ao sincronizar'}`)
    } finally {
      setSyncing(false)
    }
  }

  // Fallback de mock SO em demo. Em producao, empty state explicito.
  const hasRealData = !hook.loading && (hook.campaigns?.length ?? 0) > 0
  const campaigns: Campaign[] = isDemo ? mockCampaigns : hook.campaigns
  const creatives: CreativePerformance[] = isDemo ? mockCreatives : hook.creatives
  const loading = !isDemo && hook.loading
  const showEmpty = !isDemo && !loading && !hasRealData

  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const groups = useMemo(() => groupCampaigns(campaigns), [campaigns])
  const insights = useTrafficIntelligence(campaigns)

  // Map campaign_id → ObjectiveGroup for creative filtering
  const campaignGroupMap = useMemo(() => {
    const map = new Map<string, ObjectiveGroup>()
    for (const c of campaigns) {
      map.set(c.campaignId, OBJECTIVE_GROUP_MAP[c.objective])
    }
    return map
  }, [campaigns])

  const creativesByGroup = useMemo(() => {
    const result: Record<ObjectiveGroup, CreativePerformance[]> = { leads: [], sales: [], traffic: [], engagement: [] }
    for (const cr of creatives) {
      const group = cr.campaignId ? campaignGroupMap.get(cr.campaignId) : undefined
      if (group) result[group].push(cr)
    }
    return result
  }, [creatives, campaignGroupMap])

  const availableTabs = useMemo<TabKey[]>(() => {
    const tabs: TabKey[] = ['overview']
    for (const group of ['leads', 'sales', 'traffic', 'engagement'] as ObjectiveGroup[]) {
      if (groups[group].length > 0) tabs.push(group)
    }
    return tabs
  }, [groups])

  // Reset to overview if active tab no longer available
  if (!availableTabs.includes(activeTab)) setActiveTab('overview')

  if (loading) {
    return (
      <div>
        <PageHeader title="Tráfego" description="Inteligência em campanhas Meta Ads" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
          <span className="ml-3 text-sm text-theme-muted">Carregando dados de tráfego...</span>
        </div>
      </div>
    )
  }

  const tabLabel = (tab: TabKey) => tab === 'overview' ? 'Visão Geral' : GROUP_CONFIG[tab].label

  // Bloco WhatsApp Leads: agrega metricas das campanhas de conversa via WhatsApp + cruza
  // com agendamentos do periodo (useReportMetrics). So renderiza se whatsapp_leads estiver no foco.
  const whatsappBlock = useMemo(() => {
    if (!focuses.includes('whatsapp_leads')) return null
    const wppCamps = campaigns.filter(isWhatsAppLeadCampaign)
    if (wppCamps.length === 0) return null
    const spend = wppCamps.reduce((s, c) => s + c.spend, 0)
    const msgs = wppCamps.reduce((s, c) => s + (c.messagingReplies ?? 0), 0)
    const linkClicks = wppCamps.reduce((s, c) => s + c.linkClicks, 0)
    const agendamentos = report.data?.stats?.agendamentos?.total ?? null
    const custoPorMsg = msgs > 0 ? spend / msgs : 0
    const custoPorAgendamento = agendamentos && agendamentos > 0 ? spend / agendamentos : 0
    const taxaMsgAgendamento = msgs > 0 && agendamentos ? (agendamentos / msgs) * 100 : 0
    return { spend, msgs, linkClicks, agendamentos, custoPorMsg, custoPorAgendamento, taxaMsgAgendamento, count: wppCamps.length }
  }, [focuses, campaigns, report.data])

  return (
    <div className="gradient-mesh-traffic">
      <PageHeader
        title="Tráfego"
        description="Inteligência em campanhas Meta Ads"
        action={
          <div className="flex items-center gap-3">
            <TrafficDateFilter value={dateRange} onChange={setDateRange} />
            {!isDemo && isSuperAdmin && (
              <button
                onClick={handleSync}
                disabled={syncing || !clientId}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#1a1a1a] bg-[#0a0a0a] text-theme-secondary hover:text-theme-primary hover:border-[#2a2a2a] disabled:opacity-50 transition-colors"
                title="Puxa os ultimos 90 dias do Meta Graph API"
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Sincronizando…' : 'Sincronizar Meta'}
              </button>
            )}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-[#00D4FF10] text-[#00D4FF] border border-[#00D4FF25]">
              <Megaphone size={13} />
              {campaigns.length} campanhas
            </span>
          </div>
        }
      />

      {syncMsg && (
        <div className="mb-4 px-4 py-2 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] text-xs text-theme-secondary">{syncMsg}</div>
      )}

      {showEmpty && (
        <div className="mb-6 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-theme-muted" />
          <div className="text-sm font-semibold text-theme-primary mb-1">Nenhuma campanha encontrada no período</div>
          <p className="text-xs text-theme-muted max-w-md mx-auto mb-4">
            {isSuperAdmin
              ? 'Verifique se o cliente tem ID da conta de anúncios configurado e se os ativos estão compartilhados com a BM SMF. Use o botão acima pra forçar um sync manual.'
              : 'O dashboard é sincronizado diariamente às 03h (Brasília). Volte em breve ou peça pra equipe SMF validar o acesso da BM aos seus ativos.'}
          </p>
          {isSuperAdmin && (
            <button
              onClick={handleSync}
              disabled={syncing || !clientId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent-cyan)] text-black hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando…' : 'Sincronizar Meta Ads agora (90 dias)'}
            </button>
          )}
        </div>
      )}

      {whatsappBlock && !showEmpty && (
        <div className="mb-6 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={15} style={{ color: 'var(--accent-green)' }} />
              <span className="text-sm font-semibold text-theme-primary">Leads via WhatsApp</span>
              <span className="text-[11px] text-theme-muted">· {whatsappBlock.count} campanha{whatsappBlock.count > 1 ? 's' : ''}</span>
            </div>
            {report.isLoading && <Loader2 size={12} className="animate-spin text-theme-muted" />}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-[#1a1a1a]">
            <Stat label="Investimento" value={fmtBRL(whatsappBlock.spend)} />
            <Stat label="Conversas iniciadas" value={fmtInt(whatsappBlock.msgs)} hint="messaging_conversation_started" />
            <Stat label="Custo/conversa" value={whatsappBlock.msgs > 0 ? fmtBRL(whatsappBlock.custoPorMsg) : '—'} />
            <Stat
              label="Agendamentos"
              value={whatsappBlock.agendamentos != null ? fmtInt(whatsappBlock.agendamentos) : (report.isLoading ? '…' : '—')}
              hint="no mesmo período"
              icon={<Calendar size={11} />}
            />
            <Stat
              label="Custo/agendamento"
              value={whatsappBlock.agendamentos && whatsappBlock.agendamentos > 0 ? fmtBRL(whatsappBlock.custoPorAgendamento) : '—'}
            />
            <Stat
              label="Conversa → agenda"
              value={whatsappBlock.msgs > 0 && whatsappBlock.agendamentos ? fmtPct(whatsappBlock.taxaMsgAgendamento) : '—'}
              hint="taxa de conversão"
            />
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
        {availableTabs.map(tab => {
          const isActive = activeTab === tab
          const Icon = TAB_ICONS[tab]
          const colorVar = tab === 'overview' ? '--accent-cyan' : GROUP_CONFIG[tab].colorVar
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'surface-card text-theme-primary border border-theme shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary border border-transparent'
              }`}
            >
              <Icon size={15} style={isActive ? { color: `var(${colorVar})` } : undefined} />
              {tabLabel(tab)}
              {tab !== 'overview' && (
                <span className="text-[10px] font-data px-1.5 py-0.5 rounded"
                  style={isActive ? { backgroundColor: `color-mix(in srgb, var(${colorVar}) 10%, transparent)`, color: `var(${colorVar})` } : {}}>
                  {groups[tab].length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active tab content */}
      {activeTab === 'overview' && (
        <TrafficOverview
          campaigns={campaigns}
          insights={insights}
          onTabChange={tab => setActiveTab(tab)}
          dashboardMetrics={isDemo ? mockDashboard : dashboardData.metrics}
          isDemo={isDemo}
        />
      )}
      {activeTab === 'leads' && (
        <TrafficLeads campaigns={groups.leads} creatives={creativesByGroup.leads} insights={insights.filter(i => i.group === 'leads')} />
      )}
      {activeTab === 'sales' && (
        <TrafficSales campaigns={groups.sales} creatives={creativesByGroup.sales} insights={insights.filter(i => i.group === 'sales')} />
      )}
      {activeTab === 'traffic' && (
        <TrafficTraffic campaigns={groups.traffic} creatives={creativesByGroup.traffic} insights={insights.filter(i => i.group === 'traffic')} />
      )}
      {activeTab === 'engagement' && (
        <TrafficEngagement campaigns={groups.engagement} creatives={creativesByGroup.engagement} insights={insights.filter(i => i.group === 'engagement')} />
      )}
    </div>
  )
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-theme-muted font-semibold">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-lg font-semibold text-theme-primary mt-1 font-data">{value}</div>
      {hint && <div className="text-[10px] text-theme-muted mt-0.5">{hint}</div>}
    </div>
  )
}
