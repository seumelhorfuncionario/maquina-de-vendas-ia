import { useMemo } from 'react'
import { DollarSign, TrendingUp, ShoppingCart, Trophy, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useData } from '../contexts/DataContext'

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtDate = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString('pt-BR')
}

const BAR_COLORS = ['#00FF88', '#00D4FF', '#A855F7', '#FFD600', '#FF4D6A']

export default function Vendas() {
  const { sales, loading } = useData()

  const totalVendido = useMemo(() => sales.reduce((s, v) => s + v.total, 0), [sales])
  const ticketMedio = useMemo(() => (sales.length ? totalVendido / sales.length : 0), [sales, totalVendido])

  const topProducts = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>()
    for (const s of sales) {
      const cur = map.get(s.product) ?? { count: 0, revenue: 0 }
      cur.count += s.quantity
      cur.revenue += s.total
      map.set(s.product, cur)
    }
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [sales])

  if (loading) {
    return (
      <div>
        <PageHeader title="Vendas" description="Histórico de vendas realizadas" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
          <span className="ml-3 text-sm text-neutral-500">Carregando vendas...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Vendas" description="Histórico de vendas realizadas" />

      {/* Summary Cards - Green First */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Vendido"
          value={fmt(totalVendido)}
          icon={<DollarSign className="w-5 h-5" />}
          color="positive"
        />
        <StatCard
          title="Ticket Medio"
          value={fmt(ticketMedio)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="positive"
        />
        <StatCard
          title="Total de Vendas"
          value={sales.length}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="positive"
        />
      </div>

      {/* Top Products */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="w-5 h-5 text-[#FFD600]" />
          <h2 className="text-base font-semibold text-white">Produtos Mais Vendidos</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking list */}
          <div className="flex flex-col gap-3">
            {topProducts.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-xl bg-[#111] px-4 py-3 border border-[#1a1a1a]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-black"
                    style={{ backgroundColor: BAR_COLORS[i] }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-white font-medium">{p.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{p.count} vendas</p>
                  <p className="text-xs text-[#888]">{fmt(p.revenue)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fill: '#888', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: 12, color: '#fff', fontSize: 13 }}
                  formatter={(value: number) => [`${value} un.`, 'Quantidade']}
                  cursor={{ fill: '#ffffff08' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111] text-[#888]">
              <th className="text-left px-5 py-3 font-medium">Cliente</th>
              <th className="text-left px-5 py-3 font-medium">Produto</th>
              <th className="text-center px-5 py-3 font-medium">Qtd</th>
              <th className="text-right px-5 py-3 font-medium">Valor Unit.</th>
              <th className="text-right px-5 py-3 font-medium">Valor Total</th>
              <th className="text-right px-5 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr
                key={s.id}
                className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors"
              >
                <td className="px-5 py-3 text-white">{s.clientName}</td>
                <td className="px-5 py-3 text-[#ccc]">{s.product}</td>
                <td className="px-5 py-3 text-center text-[#ccc]">{s.quantity}</td>
                <td className="px-5 py-3 text-right text-[#ccc]">{fmt(s.unitPrice)}</td>
                <td className="px-5 py-3 text-right font-semibold text-[#00FF88]">{fmt(s.total)}</td>
                <td className="px-5 py-3 text-right text-[#888]">{fmtDate(s.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
