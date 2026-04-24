import { useMemo, useState } from 'react'
import { MessageCircle, CalendarCheck, Percent, Handshake, RefreshCw, Loader2 } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import DateRangePicker, { defaultRange } from '../components/DateRangePicker'
import AppointmentHeatmap from '../components/relatorios/AppointmentHeatmap'
import TopSlotsCard from '../components/relatorios/TopSlotsCard'
import TimeToScheduleCard from '../components/relatorios/TimeToScheduleCard'
import LostReasonsCard from '../components/relatorios/LostReasonsCard'
import { useReportMetrics } from '../hooks/useReportMetrics'
import { useClientTransfers } from '../hooks/useClientTransfers'
import { useAgentsData } from '@/hooks/useAgentsData'

export default function Dashboard() {
  const [range, setRange] = useState(() => defaultRange(7))

  const periodDays = useMemo(
    () => Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / 86400000)),
    [range]
  )

  // Fonte primária: mesma de /agendamentos, garante que KPIs batem com a lista
  const agents = useAgentsData({
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  })

  // Fonte secundária: heatmap, top slots, tempo ate agendar, motivos — via client-reports
  const { data: report, isFetching, error, refetch } = useReportMetrics(range)
  const data = report?.stats

  const transfers = useClientTransfers(periodDays)

  const totalAtendimentos = agents.chatsWhatsapp + agents.chatsInstagram
  const totalAgendamentos = agents.agendamentosCount
  const taxa = totalAtendimentos > 0
    ? Math.round((totalAgendamentos / totalAtendimentos) * 1000) / 10
    : 0

  // Gráfico: agendamentos CRIADOS pela IA por dia no periodo selecionado.
  // Usa criado_em (quando a IA fechou o agendamento), nao data_inicio
  // (quando o atendimento vai acontecer). Barra de "hoje" = agendamentos
  // que a IA fechou hoje, mesmo que o atendimento seja semana que vem.
  const chartData = useMemo(() => {
    const rangeToISO = range.to.toISOString().slice(0, 10)
    const rangeFromISO = range.from.toISOString().slice(0, 10)
    const byDay = new Map<string, number>()
    for (const ag of agents.agendamentos) {
      const src = ag.criado_em || ag.data_inicio
      if (!src) continue
      const day = src.slice(0, 10)
      if (day < rangeFromISO || day > rangeToISO) continue
      byDay.set(day, (byDay.get(day) || 0) + 1)
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({
        name: new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        agendamentos: count,
      }))
  }, [agents.agendamentos, range.from, range.to])

  const loading = agents.loading

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Visão geral do motor: atendimentos, agendamentos e transferências"
        action={
          <div className="flex items-center gap-2">
            <DateRangePicker value={range} onChange={setRange} />
            <button
              onClick={() => { agents.refetch?.(); refetch() }}
              disabled={isFetching || loading}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-theme surface-card hover:brightness-110 transition disabled:opacity-60"
            >
              {isFetching || loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Atualizar
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          Erro ao carregar relatório: {error instanceof Error ? error.message : 'desconhecido'}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-theme surface-card p-5 h-28 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Atendimentos"
              value={totalAtendimentos.toLocaleString('pt-BR')}
              subtitle={`${agents.chatsWhatsapp} WhatsApp · ${agents.chatsInstagram} Instagram`}
              icon={<MessageCircle size={18} />}
              color="neutral"
            />
            <StatCard
              title="Agendamentos"
              value={totalAgendamentos.toLocaleString('pt-BR')}
              icon={<CalendarCheck size={18} />}
              color="positive"
            />
            <StatCard
              title="Taxa de Agendamento"
              value={`${taxa}%`}
              subtitle={`${totalAgendamentos} de ${totalAtendimentos}`}
              icon={<Percent size={18} />}
              color={taxa >= 15 ? 'positive' : taxa >= 8 ? 'warning' : 'negative'}
            />
            <StatCard
              title="Transferidos para Equipe"
              value={(transfers.data?.total ?? 0).toLocaleString('pt-BR')}
              subtitle={transfers.data ? `${transfers.data.active} em aberto · ${transfers.data.finalized} finalizadas` : undefined}
              icon={<Handshake size={18} />}
              color="warning"
            />
          </div>

          {chartData.length > 0 && (
            <div className="rounded-2xl border border-theme surface-card p-6 mb-6 animate-card-in relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-cyan) 15%, transparent), transparent)' }} />
              <div className="mb-4">
                <h2 className="text-base font-bold text-theme-primary tracking-tight">Agendamentos fechados pela IA</h2>
                <p className="text-[11px] text-theme-muted mt-0.5 font-medium">Distribuição por dia</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad-agendamentos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                    </linearGradient>
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
                    allowDecimals={false}
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
                  <Area
                    type="monotone"
                    dataKey="agendamentos"
                    stroke="#00D4FF"
                    strokeWidth={2}
                    fill="url(#grad-agendamentos)"
                    name="Agendamentos"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-card)', stroke: '#00D4FF' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {data && (
            <>
              <div className="mb-6">
                <AppointmentHeatmap agendamentos={agents.agendamentos} dateFrom={range.from} dateTo={range.to} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <TopSlotsCard topDowHora={data.top_dow_hora} valorMedio={0} />
                <TimeToScheduleCard tempo={data.tempo_ate_agendar} />
              </div>

              <LostReasonsCard
                reasons={data.top_lost_reasons}
                totalAnalisados={data.total_analisados}
                totalNaoAgendaram={data.nao_agendaram.total}
                periodDays={periodDays}
                cwBaseUrl={report?.cw_base_url ?? null}
                cwAccountId={report?.cw_account_id ?? null}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}
