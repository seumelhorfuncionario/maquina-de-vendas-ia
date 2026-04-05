import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useData } from '../contexts/DataContext'
import { mockDashboard } from '../data/mock'
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowDown, ArrowUp, Minus } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Financeiro() {
  const { sales, products } = useData()
  const { revenue, trafficCost, materialCost, profit } = mockDashboard

  const barData = [
    { name: 'Receita', valor: revenue },
    { name: 'Tráfego', valor: trafficCost },
    { name: 'Materiais', valor: materialCost },
    { name: 'Lucro', valor: profit },
  ]

  const barColors: Record<string, string> = {
    Receita: '#00FF88',
    Tráfego: '#FF4D6A',
    Materiais: '#FFD600',
    Lucro: '#00D4FF',
  }

  const pieData = [
    { name: 'Tráfego', value: trafficCost },
    { name: 'Materiais', value: materialCost },
    { name: 'Lucro', value: profit },
  ]

  const pieColors = ['#FF4D6A', '#FFD600', '#00FF88']

  return (
    <div>
      <PageHeader title="Financeiro" description="Controle financeiro da operação" />

      {/* Resumo da Operação */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Resumo da Operação</h2>
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

            {/* Tráfego */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowDown className="w-5 h-5 text-[#FF4D6A]" />
                <span className="text-[#888] text-sm">Tráfego</span>
              </div>
              <span className="text-[#FF4D6A] font-semibold text-lg">-{fmt(trafficCost)}</span>
            </div>

            {/* Materiais */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowDown className="w-5 h-5 text-[#FF4D6A]" />
                <span className="text-[#888] text-sm">Materiais</span>
              </div>
              <span className="text-[#FF4D6A] font-semibold text-lg">-{fmt(materialCost)}</span>
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
          </div>
        </div>
      </div>

      {/* StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Receita Total"
          value={fmt(revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Custo de Tráfego"
          value={fmt(trafficCost)}
          icon={<TrendingDown className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="Custo de Materiais"
          value={fmt(materialCost)}
          icon={<Wallet className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          title="Lucro Líquido"
          value={fmt(profit)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          trend={{ value: 12, positive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Análise de Margem */}
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

        {/* Pie Chart - Distribuição de Custos */}
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
