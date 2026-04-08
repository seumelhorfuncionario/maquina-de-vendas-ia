import { useState } from 'react'
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
          <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
          <span className="ml-3 text-sm text-neutral-500">Carregando métricas...</span>
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
        <StatCard title="Leads Hoje" value={d.leadsToday} icon={<Users size={18} />} color="positive" stagger={1} />
        <StatCard title="Leads no Mês" value={d.leadsMonth} icon={<Users size={18} />} color="positive" stagger={2} />
        <StatCard title="Vendas Convertidas" value={d.conversions} icon={<UserCheck size={18} />} color="positive" stagger={3} />
        <StatCard title="Taxa de Conversão" value={`${d.conversionRate}%`} icon={<Percent size={18} />} color="positive" stagger={4} />
        <StatCard title="Receita Total" value={fmt(d.revenue)} icon={<DollarSign size={18} />} color="positive" stagger={5} />
        <StatCard title="Custo com Tráfego" value={fmt(d.trafficCost)} icon={<Megaphone size={18} />} color="warning" stagger={6} />
        <StatCard title="Custo com Materiais" value={fmt(d.materialCost)} icon={<Package size={18} />} color="warning" stagger={7} />
        <StatCard title="Lucro Líquido" value={fmt(d.profit)} icon={<BadgeDollarSign size={18} />} color="positive" subtitle="Resultado final do período" stagger={8} />
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 animate-card-in stagger-8 relative overflow-hidden">
        {/* Subtle top gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF20] to-transparent" />

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Desempenho de Vendas
            </h2>
            <p className="text-[11px] text-[#555] mt-0.5 font-medium">
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
                      : 'bg-[#111] text-[#555] hover:text-[#888] border border-transparent'
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
            <CartesianGrid strokeDasharray="3 3" stroke="#141414" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#555', fontSize: 11, fontFamily: 'DM Mono' }}
              axisLine={{ stroke: '#1a1a1a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#555', fontSize: 11, fontFamily: 'DM Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #222',
                borderRadius: 12,
                fontSize: 12,
                fontFamily: 'DM Mono',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: '#888', fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}
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
                activeDot={{ r: 4, strokeWidth: 2, fill: '#0a0a0a', stroke: opt.color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
