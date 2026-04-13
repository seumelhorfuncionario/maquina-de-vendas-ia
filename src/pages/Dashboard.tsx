import { useState, useEffect, useMemo } from 'react'
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
  Plus,
  Trash2,
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
import { useManualAppointments } from '@/hooks/useManualAppointments'
import { useClientId } from '@/hooks/useClientId'
import { useTenant } from '@/contexts/TenantContext'
import { supabase } from '@/integrations/supabase/client'

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const SALES_METRICS = [
  { key: 'receita', label: 'Receita', color: '#00FF88' },
  { key: 'vendas', label: 'Vendas', color: '#00D4FF' },
  { key: 'leads', label: 'Leads', color: '#A855F7' },
] as const

const SCHEDULING_METRICS = [
  { key: 'agendamentos', label: 'Agendamentos', color: '#00D4FF' },
  { key: 'receita', label: 'Receita Estimada', color: '#00FF88' },
] as const

function ManualAppointmentsCard({
  appointments,
  appointmentValue,
  totalCount,
  estimatedRevenue,
  onUpsert,
  onDelete,
}: {
  appointments: { id: string; appointment_date: string; count: number; notes: string | null; value: number | null }[]
  appointmentValue: number
  totalCount: number
  estimatedRevenue: number
  onUpsert: (date: string, count: number, notes?: string, value?: number | null) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [count, setCount] = useState(1)
  const [value, setValue] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (count < 1) return
    setSaving(true)
    const parsedValue = value.trim() !== '' ? parseFloat(value.replace(',', '.')) : null
    await onUpsert(date, count, undefined, parsedValue)
    setCount(1)
    setValue('')
    setSaving(false)
  }

  return (
    <div className="rounded-2xl border border-theme surface-card p-6 mb-8 animate-card-in relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-green) 15%, transparent), transparent)' }} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarCheck size={16} style={{ color: 'var(--accent-green)' }} />
          <h2 className="text-base font-bold text-theme-primary tracking-tight">Agendamentos Manuais</h2>
          <span className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-green) 10%, transparent)', color: 'var(--accent-green)' }}>
            {totalCount}
          </span>
        </div>
        {(appointmentValue > 0 || estimatedRevenue > 0) && (
          <span className="text-xs font-data text-theme-muted">
            Receita: <span className="text-[#00FF88] font-bold">{estimatedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-3 mb-4">
        <div className="flex-1 max-w-[180px]">
          <label className="text-[10px] text-theme-muted mb-1 block font-medium">Data</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-theme rounded-xl px-3 py-2 text-sm text-theme-primary outline-none focus:border-[#00D4FF] transition-colors font-data"
          />
        </div>
        <div className="w-[80px]">
          <label className="text-[10px] text-theme-muted mb-1 block font-medium">Qtd</label>
          <input
            type="number"
            value={count}
            onChange={e => setCount(Math.max(1, Number(e.target.value)))}
            min={1}
            className="w-full bg-[var(--bg-elevated)] border border-theme rounded-xl px-3 py-2 text-sm text-theme-primary outline-none focus:border-[#00D4FF] transition-colors font-data text-center"
          />
        </div>
        <div className="w-[120px]">
          <label className="text-[10px] text-theme-muted mb-1 block font-medium">Valor (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={appointmentValue > 0 ? (count * appointmentValue).toFixed(2) : '0,00'}
            className="w-full bg-[var(--bg-elevated)] border border-theme rounded-xl px-3 py-2 text-sm text-theme-primary outline-none focus:border-[#00D4FF] transition-colors font-data text-center placeholder:text-[#555]"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FF88] hover:bg-[#00cc6e] text-black text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Salvar
        </button>
      </div>

      {/* List */}
      {appointments.length > 0 && (
        <div className="space-y-1.5">
          {appointments.map(a => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-theme px-4 py-2.5" style={{ backgroundColor: 'var(--bg-card-hover)' }}>
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-data w-[80px]" style={{ color: 'var(--accent-cyan)' }}>
                  {new Date(a.appointment_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
                <span className="text-sm font-bold text-theme-primary">{a.count}</span>
                <span className="text-[11px] text-theme-muted">agendamento{a.count !== 1 ? 's' : ''}</span>
                {(a.value != null || appointmentValue > 0) && (
                  <span className="text-[11px] font-data text-[#00FF88]">
                    {(a.value != null ? a.value : a.count * appointmentValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                )}
              </div>
              <button
                onClick={() => onDelete(a.id)}
                className="p-1.5 rounded-lg hover:bg-[#FF4D6A15] text-[#555] hover:text-[#FF4D6A] transition-colors cursor-pointer"
                aria-label="Remover"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {appointments.length === 0 && (
        <p className="text-[11px] text-theme-muted text-center py-4">Nenhum agendamento registrado no período</p>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { isDemo } = useAuth()
  const { leads, sales } = useData()
  const realMetrics = useDashboardMetrics()

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['receita', 'vendas'])
  const { sync, syncing } = useSync()
  const { clientId } = useClientId()
  const { hasFeature } = useTenant()

  // Filtro de período
  const [periodDays, setPeriodDays] = useState(30)
  const dateFrom = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()
  const dateFromStr = dateFrom.split('T')[0]
  const agents = useAgentsData(dateFrom)
  const manualAppts = useManualAppointments(dateFromStr)
  const hasManualScheduling = hasFeature('manual_scheduling')

  // Dashboard config + client_type
  const [dc, setDc] = useState<Record<string, boolean>>({
    leads_today: true, leads_month: true, conversions: true, conversion_rate: true,
    revenue: true, traffic_cost: true, material_cost: true, profit: true,
  })
  const [clientType, setClientType] = useState<string>('product_sales')

  useEffect(() => {
    if (!clientId) return
    supabase.from('clients').select('dashboard_config, client_type').eq('id', clientId).single()
      .then(({ data }) => {
        if (data?.dashboard_config) setDc(data.dashboard_config as Record<string, boolean>)
        if (data?.client_type) setClientType(data.client_type)
      })
  }, [clientId])

  const isScheduling = clientType === 'scheduling'
  const METRIC_OPTIONS = isScheduling ? SCHEDULING_METRICS : SALES_METRICS

  // Inicializar métricas selecionadas com base no tipo
  useEffect(() => {
    if (isScheduling) setSelectedMetrics(['agendamentos', 'receita'])
    else setSelectedMetrics(['receita', 'vendas'])
  }, [isScheduling])

  // Chart data para scheduling — agregar agendamentos (agente + manuais) por dia
  const schedulingChartData = useMemo(() => {
    if (!isScheduling) return []
    const byDay = new Map<string, { agendamentos: number; receita: number }>()
    const apptValue = manualAppts.appointmentValue || agents.appointmentValue || 0
    for (const ag of agents.agendamentos) {
      const day = ag.data_inicio.slice(0, 10)
      const cur = byDay.get(day) || { agendamentos: 0, receita: 0 }
      cur.agendamentos++
      cur.receita += apptValue
      byDay.set(day, cur)
    }
    if (hasManualScheduling) {
      for (const ma of manualAppts.appointments) {
        const day = ma.appointment_date
        const cur = byDay.get(day) || { agendamentos: 0, receita: 0 }
        cur.agendamentos += ma.count
        cur.receita += ma.value != null ? ma.value : ma.count * apptValue
        byDay.set(day, cur)
      }
    }
    if (byDay.size === 0) return []
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, data]) => ({
        name: new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        ...data,
      }))
  }, [isScheduling, agents.agendamentos, agents.appointmentValue, hasManualScheduling, manualAppts.appointments, manualAppts.appointmentValue])

  // Para scheduling, métricas vêm do banco de agentes OU de agendamentos manuais
  const schedulingMetrics = useMemo(() => {
    const totalChats = agents.chatsWhatsapp + agents.chatsInstagram
    // Se manual_scheduling ativo, somar agendamentos manuais
    const agentCount = agents.agendamentosCount
    const manualCount = hasManualScheduling ? manualAppts.totalCount : 0
    const totalAppointments = agentCount + manualCount
    const manualRevenue = hasManualScheduling ? manualAppts.estimatedRevenue : 0
    const totalRevenue = agents.estimatedRevenue + manualRevenue
    return {
      leadsToday: 0,
      leadsMonth: totalChats,
      conversions: totalAppointments,
      conversionRate: totalChats > 0
        ? Math.round((totalAppointments / totalChats) * 100 * 10) / 10
        : 0,
      revenue: totalRevenue,
      trafficCost: 0,
      materialCost: 0,
      profit: totalRevenue,
      machineActive: realMetrics.metrics.machineActive,
    }
  }, [agents, realMetrics.metrics.machineActive, hasManualScheduling, manualAppts.totalCount, manualAppts.estimatedRevenue])

  const d = isDemo ? mockDashboard : isScheduling ? schedulingMetrics : realMetrics.metrics
  const rawChartData = isDemo ? mockChartData : realMetrics.chartData
  const chartData = isScheduling ? schedulingChartData : rawChartData
  const loading = !isDemo && (isScheduling ? agents.loading : realMetrics.loading)

  const toggleMetric = (key: string) => {
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
        {dc.leads_today !== false && !isScheduling && <StatCard title="Leads Hoje" value={d.leadsToday} icon={<Users size={18} />} color="positive" stagger={1} />}
        {dc.leads_month !== false && <StatCard title={isScheduling ? `Atendimentos (${periodDays}d)` : "Leads no Mês"} value={d.leadsMonth} icon={isScheduling ? <MessageCircle size={18} /> : <Users size={18} />} color="positive" stagger={2} />}
        {dc.conversions !== false && <StatCard title={isScheduling ? "Agendamentos" : "Vendas Convertidas"} value={d.conversions} icon={isScheduling ? <CalendarCheck size={18} /> : <UserCheck size={18} />} color="positive" stagger={3} />}
        {dc.conversion_rate !== false && <StatCard title={isScheduling ? "Taxa de Agendamento" : "Taxa de Conversão"} value={`${d.conversionRate}%`} icon={<Percent size={18} />} color="positive" stagger={4} />}
        {dc.revenue !== false && !(isScheduling && !agents.appointmentValue) && <StatCard title={isScheduling ? "Receita Estimada" : "Receita Total"} value={fmt(d.revenue)} icon={<DollarSign size={18} />} color="positive" stagger={5} />}
        {dc.traffic_cost !== false && <StatCard title="Custo com Tráfego" value={fmt(d.trafficCost)} icon={<Megaphone size={18} />} color="warning" stagger={6} />}
        {dc.material_cost !== false && <StatCard title="Custo com Materiais" value={fmt(d.materialCost)} icon={<Package size={18} />} color="warning" stagger={7} />}
        {dc.profit !== false && !isScheduling && <StatCard title="Lucro Líquido" value={fmt(d.profit)} icon={<BadgeDollarSign size={18} />} color="positive" subtitle="Resultado final do período" stagger={8} />}
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

      {/* Agendamentos Manuais — input direto no dash */}
      {hasManualScheduling && (
        <ManualAppointmentsCard
          appointments={manualAppts.appointments}
          appointmentValue={manualAppts.appointmentValue}
          totalCount={manualAppts.totalCount}
          estimatedRevenue={manualAppts.estimatedRevenue}
          onUpsert={manualAppts.upsertAppointment}
          onDelete={manualAppts.deleteAppointment}
        />
      )}

      {/* Chart Section */}
      <div className="rounded-2xl border border-theme surface-card p-6 animate-card-in stagger-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-cyan) 15%, transparent), transparent)' }} />

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-theme-primary tracking-tight">
              {isScheduling ? 'Agendamentos no Período' : 'Desempenho de Vendas'}
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
