import { UserX, Loader2, Sparkles } from 'lucide-react'
import type { ReportStats, LostReasonCategory } from '@/hooks/useReportMetrics'
import { useAnalyzeLostChats } from '@/hooks/useAnalyzeLostChats'

const CATEGORY_META: Record<LostReasonCategory, { label: string; color: string; icon: string }> = {
  preco:             { label: 'Preço',             color: '--accent-red',    icon: '💰' },
  horario:           { label: 'Horário',           color: '--accent-yellow', icon: '🕐' },
  sem_resposta:      { label: 'Parou de responder',color: '--accent-cyan',   icon: '💬' },
  duvida_nao_sanada: { label: 'Dúvida não sanada', color: '--accent-purple', icon: '❓' },
  ja_tem_outro:      { label: 'Já tem outro',      color: '--accent-green',  icon: '🔁' },
  nao_qualificado:   { label: 'Fora do perfil',    color: '--accent-red',    icon: '✖' },
  pesquisando:       { label: 'Pesquisando',       color: '--accent-cyan',   icon: '🔍' },
  outro:             { label: 'Outro',             color: '--accent-yellow', icon: '•' },
}

interface Props {
  reasons: ReportStats['top_lost_reasons']
  totalAnalisados: number
  totalNaoAgendaram: number
  periodDays: number
}

export default function LostReasonsCard({ reasons, totalAnalisados, totalNaoAgendaram, periodDays }: Props) {
  const analyze = useAnalyzeLostChats()
  const pendingAnalysis = Math.max(0, totalNaoAgendaram - totalAnalisados)
  const maxCount = reasons[0]?.count ?? 0

  return (
    <div className="rounded-2xl border border-theme surface-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <UserX size={16} style={{ color: 'var(--accent-red)' }} />
          <h3 className="text-sm font-semibold text-theme-primary">Motivos de não-agendamento</h3>
        </div>
        <button
          type="button"
          onClick={() => analyze.mutate({ batchSize: 15, periodDays })}
          disabled={analyze.isPending || pendingAnalysis === 0}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-theme hover:brightness-110 transition disabled:opacity-50"
          title={pendingAnalysis === 0 ? 'Todos os chats do período já foram analisados' : `Analisar até 15 chats ainda não classificados`}
        >
          {analyze.isPending ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Analisando...
            </>
          ) : (
            <>
              <Sparkles size={12} /> Analisar {pendingAnalysis > 0 ? `(${pendingAnalysis} pendentes)` : ''}
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-theme-tertiary mb-4">
        Classificado por IA analisando as últimas mensagens das conversas sem agendamento.
        {totalAnalisados > 0 && ` ${totalAnalisados} de ${totalNaoAgendaram} já analisados.`}
      </p>

      {analyze.isError && (
        <div className="mb-3 text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {analyze.error instanceof Error ? analyze.error.message : 'Erro ao analisar'}
        </div>
      )}

      {analyze.isSuccess && analyze.data && (
        <div className="mb-3 text-[11px] text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
          {analyze.data.processed} novos chats classificados. {analyze.data.pending} ainda pendentes.
        </div>
      )}

      {reasons.length === 0 ? (
        <div className="rounded-xl border border-theme px-4 py-8 text-center">
          <p className="text-xs text-theme-tertiary">
            Nenhum motivo classificado ainda. Clique em "Analisar" para a IA categorizar os chats sem agendamento.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {reasons.map((r) => {
            const meta = CATEGORY_META[r.category] ?? CATEGORY_META.outro
            const barWidth = maxCount > 0 ? (r.count / maxCount) * 100 : 0
            return (
              <li key={r.category} className="grid grid-cols-[140px_1fr_auto] gap-3 items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">{meta.icon}</span>
                  <span className="text-xs text-theme-primary truncate">{meta.label}</span>
                </div>
                <div className="relative h-6 rounded-lg overflow-hidden" style={{ background: 'color-mix(in srgb, var(--accent-cyan) 8%, transparent)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all"
                    style={{
                      width: `${barWidth}%`,
                      background: `color-mix(in srgb, var(${meta.color}) 60%, transparent)`,
                    }}
                  />
                  <span className="relative z-10 flex items-center h-full px-2.5 text-[10px] font-semibold text-theme-primary">
                    {r.pct}%
                  </span>
                </div>
                <span className="text-xs font-data text-theme-tertiary tabular-nums">
                  {r.count}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
