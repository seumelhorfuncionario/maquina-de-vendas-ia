import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useAuth } from '../contexts/AuthContext'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import { mockDashboard } from '../data/mock'
import {
  DollarSign, TrendingUp, TrendingDown, Wallet,
  ArrowDown, ArrowUp, Minus, Loader2, Handshake,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Financeiro() {
  const { isDemo } = useAuth()
  const real = useFinanceiro()

  // Demo ou real
  const revenue = isDemo ? mockDashboard.revenue : real.revenue
  const trafficCost = isDemo ? mockDashboard.trafficCost : real.trafficCost
  const materialCost = isDemo ? mockDashboard.materialCost : real.materialCost
  const profit = isDemo ? mockDashboard.profit : real.profit
  const splitPartner = isDemo ? mockDashboard.profit * 0.5 : real.splitPartner
  const splitClient = isDemo ? mockDashboard.profit * 0.5 : real.splitClient
  const loading = !isDemo && real.loading

  const barData = [
    { name: 'Receita', valor: revenue },
    { name: 'Tráfego', valor: trafficCost },
    { name: 'Materiais', valor: materialCost },
    { name: 'Lucro', valor: profit },
  ]

  const barColors: Record<string, string> = {
    Receita: '#00FF88',
    'Tráfego': '#FFD600',
    Materiais: '#FFD600',
    Lucro: '#00FF88',
  }

  const pieData = [
    { name: 'Tráfego', value: trafficCost },
    { name: 'Materiais', value: materialCost },
    { name: 'Lucro', value: profit },
  ]

  const pieColors = ['#FFD600', '#FF4D6A', '#00FF88']

  if (loading) {
    return (
      <div>
        <PageHeader title="Financeiro" description="Controle financeiro da operação" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
          <span className="ml-3 text-sm text-neutral-500">Carregando financeiro...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Financeiro" description="Controle financeiro da operação" />

      {/* Resumo da Operacao */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Resumo da Operacao</h2>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
          <div className="space-y-4">
            {/* Receita */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowUp className="w-5 h-5 text-[#00FF88]" />
                <span className="text-[#888] text-sm">Receita</span>
              </div>
              <span className="text-[#00FF88] font-semibold text-lg">{fmt(revenue)}</span>
            </div>

            {/* Trafego */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowDown className="w-5 h-5 text-[#FFD600]" />
                <span className="text-[#888] text-sm">Investimento em Tráfego</span>
              </div>
              <span className="text-[#FFD600] font-semibold text-lg">-{fmt(trafficCost)}</span>
            </div>

            {/* Materiais */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowDown className="w-5 h-5 text-[#FFD600]" />
                <span className="text-[#888] text-sm">Custo com Materiais</span>
              </div>
              <span className="text-[#FFD600] font-semibold text-lg">-{fmt(materialCost)}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-[#1a1a1a] my-2" />

            {/* Lucro Líquido */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Minus className="w-5 h-5 text-[#00FF88]" />
                <span className="text-white font-bold text-base">Lucro Líquido</span>
              </div>
              <span className="text-3xl font-bold text-[#00FF88] drop-shadow-[0_0_20px_#00FF8880]">
                {fmt(profit)}
              </span>
            </div>

            {/* Split 50/50 */}
            <div className="border-t border-[#1a1a1a] my-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Handshake className="w-5 h-5 text-[#00D4FF]" />
                <span className="text-[#888] text-sm">Sua parte (50%)</span>
              </div>
              <span className="text-[#00D4FF] font-bold text-xl">{fmt(splitClient)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Handshake className="w-5 h-5 text-[#A855F7]" />
                <span className="text-[#888] text-sm">Parceiro comercial (50%)</span>
              </div>
              <span className="text-[#A855F7] font-semibold text-lg">{fmt(splitPartner)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* StatCards Grid - Green First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Receita Total"
          value={fmt(revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          color="positive"
        />
        <StatCard
          title="Investimento Tráfego"
          value={fmt(trafficCost)}
          icon={<TrendingDown className="w-5 h-5" />}
          color="warning"
        />
        <StatCard
          title="Custo de Materiais"
          value={fmt(materialCost)}
          icon={<Wallet className="w-5 h-5" />}
          color="warning"
        />
        <StatCard
          title="Lucro Líquido"
          value={fmt(profit)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="positive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Análise de Margem</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 12 }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => [fmt(value), 'Valor']}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={barColors[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Distribuição de Custos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 12 }}
                  formatter={(value: number) => [fmt(value), 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
