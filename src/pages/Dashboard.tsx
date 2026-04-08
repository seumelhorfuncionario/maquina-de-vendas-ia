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

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Opcoes de metricas disponiveis para o grafico
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

  // Seleciona dados demo ou real
  const d = isDemo ? mockDashboard : realMetrics.metrics
  const chartData = isDemo ? mockChartData : realMetrics.chartData
  const loading = !isDemo && realMetrics.loading

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev // Manter ao menos 1
        return prev.filter(m => m !== key)
      }
      return [...prev, key]
    })
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Visao geral da sua maquina de vendas" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
          <span className="ml-3 text-sm text-neutral-500">Carregando metricas...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visao geral da sua maquina de vendas"
        action={
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${
              d.machineActive
                ? 'bg-[#00FF8818] text-[#00FF88] border border-[#00FF8830]'
                : 'bg-[#FF4D6A18] text-[#FF4D6A] border border-[#FF4D6A30]'
            }`}
          >
            <Activity size={14} />
            {d.machineActive ? 'Maquina Ativa' : 'Pausada'}
          </span>
        }
      />

      {/* Stat Cards - Green First */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Leads Hoje"
          value={d.leadsToday}
          icon={<Users size={18} />}
          color="positive"
        />
        <StatCard
          title="Leads no Mes"
          value={d.leadsMonth}
          icon={<Users size={18} />}
          color="positive"
        />
        <StatCard
          title="Vendas Convertidas"
          value={d.conversions}
          icon={<UserCheck size={18} />}
          color="positive"
        />
        <StatCard
          title="Taxa de Conversao"
          value={`${d.conversionRate}%`}
          icon={<Percent size={18} />}
          color="positive"
        />
        <StatCard
          title="Receita Total"
          value={fmt(d.revenue)}
          icon={<DollarSign size={18} />}
          color="positive"
        />
        <StatCard
          title="Custo com Trafego"
          value={fmt(d.trafficCost)}
          icon={<Megaphone size={18} />}
          color="warning"
        />
        <StatCard
          title="Custo com Materiais"
          value={fmt(d.materialCost)}
          icon={<Package size={18} />}
          color="warning"
        />
        <StatCard
          title="Lucro Liquido"
          value={fmt(d.profit)}
          icon={<BadgeDollarSign size={18} />}
          color="positive"
          subtitle="Resultado final do periodo"
        />
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">
              Desempenho de Vendas
            </h2>
            <p className="text-xs text-[#555]">
              Selecione as metricas para comparar
            </p>
          </div>

          {/* Combo Box - Metric Selector */}
          <div className="flex gap-2">
            {METRIC_OPTIONS.map(opt => {
              const isActive = selectedMetrics.includes(opt.key)
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleMetric(opt.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'border'
                      : 'bg-[#111] text-[#555] hover:text-[#888]'
                  }`}
                  style={isActive ? {
                    backgroundColor: opt.color + '15',
                    borderColor: opt.color + '40',
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
                  <stop offset="0%" stopColor={opt.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={opt.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 12 }} />
            <YAxis tick={{ fill: '#555', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid #222',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#888' }}
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
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
