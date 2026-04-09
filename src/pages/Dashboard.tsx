import { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  TrendingUp,
  Percent,
  DollarSign,
  Megaphone,
  Package,
  BadgeDollarSign,
  Activity,
  Loader2,
  RefreshCw,
  CalendarCheck,
  MessageCircle,
  Instagram,
  Calendar,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import StatCard from '../components/StatCard'
import PageHeader from '../components/PageHeader'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { mockDashboard, mockChartData } from '../data/mock'
import { useSync } from '@/hooks/useSync'
import { useAgentsData } from '@/hooks/useAgentsData'
import { useClientId } from '@/hooks/useClientId'
import { supabase } from '@/integrations/supabase/client'

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const METRIC_OPTIONS = [
  { key: 'receita', label: 'Receita', color: '#00FF88' },
  { key: 'vendas', label: 'Vendas', color: '#00D4FF' },
  { key: 'leads', label: 'Leads', color: '#A855F7' },
] as const

type MetricKey = typeof METRIC_OPTIONS[number]['key']

export default function Dashboard() {
  const { isDemo } = useAuth()
  const { leads, sales } = useData()
  const realMetrics = useDashboardMetrics()

  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(['receita', 'vendas'])
  const { sync, syncing } = useSync()
  const { clientId } = useClientId()

  // Filtro de período
  const [periodDays, setPeriodDays] = useState(30)
  const dateFrom = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()
  const agents = useAgentsData(dateFrom)

  // Dashboard config — quais cards mostrar
  const [dc, setDc] = useState<Record<string, boolean>>({
    leads_today: true, leads_month: true, conversions: true, conversion_rate: true,
    revenue: true, traffic_cost: true, material_cost: true, profit: true,
  })

  useEffect(() => {
    if (!clientId) return
    supabase.from('clients').select('dashboard_config').eq('id', clientId).single()
      .then(({ data }) => {
        if (data?.dashboard_config) setDc(data.dashboard_config as Record<string, boolean>)
      })
  }, [clientId])

  const d = isDemo ? mockDashboard : realMetrics.metrics
  const chartData = isDemo ? mockChartData : realMetrics.chartData
  const loading = !isDemo && realMetrics.loading

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev
        return prev.filter(m => m !== key)
      }
      return [...prev, key]
    })
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Visão geral da sua máquina de vendas" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
          <span className="ml-3 text-sm text-theme-muted">Carregando métricas...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua máquina de vendas"
        action={
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex items-center gap-1 surface-elevated rounded-full border border-theme p-0.5">
              {[{ days: 7, label: '7d' }, { days: 30, label: '30d' }].map(opt => (
                <button
                  key={opt.days}
                  onClick={() => setPeriodDays(opt.days)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    periodDays === opt.days
                      ? 'surface-card text-theme-primary shadow-sm'
                      : 'text-theme-muted hover:text-theme-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={async () => { await sync(); realMetrics.refetch?.() }}
              disabled={syncing}
              aria-label="Sincronizar com CRM"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#00D4FF10] text-[#00D4FF] border border-[#00D4FF25] hover:bg-[#00D4FF20] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${
                d.machineActive
                  ? 'bg-[#00FF8810] text-[#00FF88] border border-[#00FF8825]'
                  : 'bg-[#FF4D6A10] text-[#FF4D6A] border border-[#FF4D6A25]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${d.machineActive ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FF4D6A]'}`} />
              {d.machineActive ? 'Máquina Ativa' : 'Pausada'}
            </span>
          </div>
        }
      />

      {/* Stat Cards Grid — staggered entrance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dc.leads_today !== false && <StatCard title="Leads Hoje" value={d.leadsToday} icon={<Users size={18} />} color="positive" stagger={1} />}
        {dc.leads_month !== false && <StatCard title="Leads no Mês" value={d.leadsMonth} icon={<Users size={18} />} color="positive" stagger={2} />}
        {dc.conversions !== false && <StatCard title="Vendas Convertidas" value={d.conversions} icon={<UserCheck size={18} />} color="positive" stagger={3} />}
        {dc.conversion_rate !== false && <StatCard title="Taxa de Conversão" value={`${d.conversionRate}%`} icon={<Percent size={18} />} color="positive" stagger={4} />}
        {dc.revenue !== false && <StatCard title="Receita Total" value={fmt(d.revenue)} icon={<DollarSign size={18} />} color="positive" stagger={5} />}
        {dc.traffic_cost !== false && <StatCard title="Custo com Tráfego" value={fmt(d.trafficCost)} icon={<Megaphone size={18} />} color="warning" stagger={6} />}
        {dc.material_cost !== false && <StatCard title="Custo com Materiais" value={fmt(d.materialCost)} icon={<Package size={18} />} color="warning" stagger={7} />}
        {dc.profit !== false && <StatCard title="Lucro Líquido" value={fmt(d.profit)} icon={<BadgeDollarSign size={18} />} color="positive" subtitle="Resultado final do período" stagger={8} />}
      </div>

      {/* Agents Cards — só mostra se tiver dados do banco de agentes */}
      {!agents.loading && (agents.agendamentosCount > 0 || agents.chatsWhatsapp > 0 || agents.chatsInstagram > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title={`Agendamentos (${periodDays}d)`} value={agents.agendamentosCount} icon={<CalendarCheck size={18} />} color="neutral" stagger={1} />
          {agents.appointmentValue > 0 && (
            <StatCard title="Receita Estimada" value={fmt(agents.estimatedRevenue)} icon={<DollarSign size={18} />} color="positive" stagger={2} />
          )}
          <StatCard title={`Chats WhatsApp (${periodDays}d)`} value={agents.chatsWhatsapp.toLocaleString()} icon={<MessageCircle size={18} />} color="positive" stagger={3} subtitle={`Total: ${agents.chatsWhatsappTotal.toLocaleString()}`} />
          {(agents.chatsInstagram > 0 || agents.chatsInstagramTotal > 0) && (
            <StatCard title={`Chats Instagram (${periodDays}d)`} value={agents.chatsInstagram.toLocaleString()} icon={<Instagram size={18} />} color="purple" stagger={4} subtitle={`Total: ${agents.chatsInstagramTotal.toLocaleString()}`} />
          )}
        </div>
      )}

      {/* Lista de agendamentos do mês */}
      {agents.agendamentos.length > 0 && (
        <div className="rounded-2xl border border-theme surface-card p-6 mb-8 animate-card-in stagger-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-purple) 15%, transparent), transparent)' }} />
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="text-base font-bold text-theme-primary tracking-tight">Agendamentos do Mês</h2>
            <span className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)', color: 'var(--accent-cyan)' }}>
              {agents.agendamentosCount}
            </span>
          </div>
          <div className="space-y-2">
            {agents.agendamentos.slice(0, 8).map(ag => {
              const date = new Date(ag.data_inicio)
              const isPast = date < new Date()
              return (
                <div key={ag.id} className={`flex items-center justify-between rounded-xl surface-card-hover border border-theme px-4 py-3 ${isPast ? 'opacity-50' : ''}`} style={{ backgroundColor: 'var(--bg-card-hover)' }}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[11px] font-data w-[70px] flex-shrink-0" style={{ color: 'var(--accent-cyan)' }}>
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm font-semibold text-theme-primary truncate">{ag.nome_cliente}</span>
                  </div>
                  <span className="text-[11px] text-[#666] truncate max-w-[250px] ml-3 hidden lg:block">{ag.procedimento}</span>
                </div>
              )
            })}
            {agents.agendamentosCount > 8 && (
              <p className="text-[11px] text-[#555] text-center pt-1">+{agents.agendamentosCount - 8} agendamentos</p>
            )}
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="rounded-2xl border border-theme surface-card p-6 animate-card-in stagger-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-cyan) 15%, transparent), transparent)' }} />

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-theme-primary tracking-tight">
              Desempenho de Vendas
            </h2>
            <p className="text-[11px] text-theme-muted mt-0.5 font-medium">
              Selecione as métricas para comparar
            </p>
          </div>

          <div className="flex gap-1.5">
            {METRIC_OPTIONS.map(opt => {
              const isActive = selectedMetrics.includes(opt.key)
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleMetric(opt.key)}
                  aria-pressed={isActive}
                  aria-label={`Métrica ${opt.label}`}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'border'
                      : 'surface-elevated text-theme-muted hover:text-theme-secondary border border-transparent'
                  }`}
                  style={isActive ? {
                    backgroundColor: opt.color + '10',
                    borderColor: opt.color + '30',
                    color: opt.color,
                  } : undefined}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              {METRIC_OPTIONS.map(opt => (
                <linearGradient key={opt.key} id={`grad-${opt.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={opt.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={opt.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Mono' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 12,
                fontFamily: 'DM Mono',
                color: 'var(--text-primary)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}
            />
            {METRIC_OPTIONS.filter(opt => selectedMetrics.includes(opt.key)).map(opt => (
              <Area
                key={opt.key}
                type="monotone"
                dataKey={opt.key}
                stroke={opt.color}
                strokeWidth={2}
                fill={`url(#grad-${opt.key})`}
                name={opt.label}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-card)', stroke: opt.color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
