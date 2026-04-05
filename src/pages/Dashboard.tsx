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
import { mockDashboard, mockChartData } from '../data/mock'

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard() {
  const { leads, sales } = useData()
  const d = mockDashboard

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua máquina de vendas"
        action={
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${
              d.machineActive
                ? 'bg-[#00FF8818] text-[#00FF88] border border-[#00FF8830]'
                : 'bg-[#FF4D6A18] text-[#FF4D6A] border border-[#FF4D6A30]'
            }`}
          >
            <Activity size={14} />
            {d.machineActive ? 'Máquina Ativa' : 'Pausada'}
          </span>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Leads Hoje"
          value={d.leadsToday}
          icon={<Users size={18} />}
          color="blue"
        />
        <StatCard
          title="Leads no Mês"
          value={d.leadsMonth}
          icon={<Users size={18} />}
          color="blue"
        />
        <StatCard
          title="Vendas Convertidas"
          value={d.conversions}
          icon={<UserCheck size={18} />}
          color="green"
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${d.conversionRate}%`}
          icon={<Percent size={18} />}
          color="purple"
        />
        <StatCard
          title="Receita Total"
          value={fmt(d.revenue)}
          icon={<DollarSign size={18} />}
          color="green"
        />
        <StatCard
          title="Custo com Tráfego"
          value={fmt(d.trafficCost)}
          icon={<Megaphone size={18} />}
          color="red"
        />
        <StatCard
          title="Custo com Materiais"
          value={fmt(d.materialCost)}
          icon={<Package size={18} />}
          color="yellow"
        />
        <StatCard
          title="Lucro Líquido"
          value={fmt(d.profit)}
          icon={<BadgeDollarSign size={18} />}
          color="green"
          subtitle="Resultado final do período"
        />
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <h2 className="text-lg font-semibold text-white mb-1">
          Desempenho de Vendas
        </h2>
        <p className="text-xs text-[#555] mb-6">
          Vendas e receita ao longo do tempo
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={mockChartData}>
            <defs>
              <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF88" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
              </linearGradient>
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
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="#00D4FF"
              strokeWidth={2}
              fill="url(#gradVendas)"
              name="Vendas"
            />
            <Area
              type="monotone"
              dataKey="receita"
              stroke="#00FF88"
              strokeWidth={2}
              fill="url(#gradReceita)"
              name="Receita (R$)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
