import { useMemo, useState } from 'react'
import { MessageCircle, CalendarCheck, Percent, Handshake, RefreshCw, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import DateRangePicker, { defaultRange } from '../components/DateRangePicker'
import AppointmentHeatmap from '../components/relatorios/AppointmentHeatmap'
import TopSlotsCard from '../components/relatorios/TopSlotsCard'
import TimeToScheduleCard from '../components/relatorios/TimeToScheduleCard'
import LostReasonsCard from '../components/relatorios/LostReasonsCard'
import { useReportMetrics } from '../hooks/useReportMetrics'
import { useClientTransfers } from '../hooks/useClientTransfers'

export default function Dashboard() {
  const [range, setRange] = useState(() => defaultRange(7))
  const { data, isLoading, isFetching, error, refetch } = useReportMetrics(range)

  const periodDays = useMemo(
    () => Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / 86400000)),
    [range]
  )
  const transfers = useClientTransfers(periodDays)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do motor: atendimentos, agendamentos e transferências"
        action={
          <div className="flex items-center gap-2">
            <DateRangePicker value={range} onChange={setRange} />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-theme surface-card hover:brightness-110 transition disabled:opacity-60"
            >
              {isFetching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
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

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-theme surface-card p-5 h-28 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Atendimentos"
              value={data.atendimentos.total.toLocaleString('pt-BR')}
              subtitle={`${data.atendimentos.whatsapp} WhatsApp · ${data.atendimentos.instagram} Instagram`}
              icon={<MessageCircle size={18} />}
              color="neutral"
            />
            <StatCard
              title="Agendamentos"
              value={data.agendamentos.total.toLocaleString('pt-BR')}
              icon={<CalendarCheck size={18} />}
              color="positive"
            />
            <StatCard
              title="Taxa de Agendamento"
              value={`${data.taxa_agendamento_pct}%`}
              subtitle={`${data.agendamentos.total} de ${data.atendimentos.total}`}
              icon={<Percent size={18} />}
              color={data.taxa_agendamento_pct >= 15 ? 'positive' : data.taxa_agendamento_pct >= 8 ? 'warning' : 'negative'}
            />
            <StatCard
              title="Transferidos para Equipe"
              value={(transfers.data?.total ?? 0).toLocaleString('pt-BR')}
              subtitle={transfers.data ? `${transfers.data.active} em aberto · ${transfers.data.finalized} finalizadas` : undefined}
              icon={<Handshake size={18} />}
              color="warning"
            />
          </div>

          <div className="mb-6">
            <AppointmentHeatmap heatmap={data.heatmap} />
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
          />
        </>
      )}
    </div>
  )
}
