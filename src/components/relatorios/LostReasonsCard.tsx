import { useEffect, useRef, useState } from 'react'
import { UserX, Loader2, ExternalLink } from 'lucide-react'
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

const AUTO_BATCH_SIZE = 50
const MAX_AUTO_BATCHES = 20 // limite de segurança: até 1000 chats/sessão

interface Props {
  reasons: ReportStats['top_lost_reasons']
  totalAnalisados: number
  totalNaoAgendaram: number
  periodDays: number
  cwBaseUrl: string | null
  cwAccountId: string | null
}

export default function LostReasonsCard({
  reasons,
  totalAnalisados,
  totalNaoAgendaram,
  periodDays,
  cwBaseUrl,
  cwAccountId,
}: Props) {
  const analyze = useAnalyzeLostChats()
  const pendingAnalysis = Math.max(0, totalNaoAgendaram - totalAnalisados)
  const maxCount = reasons[0]?.count ?? 0
  const [openCategory, setOpenCategory] = useState<LostReasonCategory | null>(null)

  // Auto-analise em loop: enquanto tiver pendentes e não tiver rodando, dispara o próximo batch
  const loopCountRef = useRef(0)
  useEffect(() => {
    loopCountRef.current = 0
  }, [periodDays])

  useEffect(() => {
    if (pendingAnalysis === 0) return
    if (analyze.isPending) return
    if (loopCountRef.current >= MAX_AUTO_BATCHES) return
    loopCountRef.current += 1
    analyze.mutate({ batchSize: AUTO_BATCH_SIZE, periodDays })
  }, [pendingAnalysis, analyze.isPending, periodDays])

  const buildChatUrl = (conversationId: string | null) => {
    if (!conversationId || !cwBaseUrl || !cwAccountId) return null
    return `${cwBaseUrl}/app/accounts/${cwAccountId}/conversations/${conversationId}`
  }

  const progressPct = totalNaoAgendaram > 0
    ? Math.round((totalAnalisados / totalNaoAgendaram) * 100)
    : 100

  return (
    <div className="rounded-2xl border border-theme surface-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <UserX size={16} style={{ color: 'var(--accent-red)' }} />
          <h3 className="text-sm font-semibold text-theme-primary">Motivos de não-agendamento</h3>
        </div>
        {(analyze.isPending || pendingAnalysis > 0) && (
          <div className="flex items-center gap-2 text-[11px] text-theme-muted">
            <Loader2 size={12} className="animate-spin" />
            Analisando {totalAnalisados}/{totalNaoAgendaram}…
          </div>
        )}
      </div>

      <p className="text-xs text-theme-tertiary mb-3">
        Classificado por IA analisando as últimas mensagens das conversas sem agendamento.{' '}
        {totalAnalisados > 0 && `${totalAnalisados} de ${totalNaoAgendaram} já analisados (${progressPct}%).`}
      </p>

      {/* Barra de progresso sutil */}
      {totalNaoAgendaram > 0 && totalAnalisados < totalNaoAgendaram && (
        <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)' }}>
          <div
            className="h-full transition-all"
            style={{ width: `${progressPct}%`, background: 'var(--accent-cyan)' }}
          />
        </div>
      )}

      {analyze.isError && (
        <div className="mb-3 text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {analyze.error instanceof Error ? analyze.error.message : 'Erro ao analisar'}
        </div>
      )}

      {reasons.length === 0 && !analyze.isPending && (
        <div className="rounded-xl border border-theme px-4 py-8 text-center">
          <p className="text-xs text-theme-tertiary">
            Nenhum motivo classificado ainda.
          </p>
        </div>
      )}

      {reasons.length > 0 && (
        <ul className="space-y-2 relative">
          {reasons.map((r) => {
            const meta = CATEGORY_META[r.category] ?? CATEGORY_META.outro
            const barWidth = maxCount > 0 ? (r.count / maxCount) * 100 : 0
            const isOpen = openCategory === r.category
            return (
              <li key={r.category} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? null : r.category)}
                  onMouseEnter={() => setOpenCategory(r.category)}
                  onMouseLeave={() => setOpenCategory(null)}
                  className="w-full grid grid-cols-[140px_1fr_auto] gap-3 items-center text-left cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                  aria-label={`${meta.label} — ${r.count} chats`}
                >
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
                </button>

                {isOpen && r.chats.length > 0 && (
                  <div
                    className="absolute right-0 top-full mt-1 z-20 w-[360px] max-h-[320px] overflow-y-auto rounded-xl border border-theme shadow-2xl p-3"
                    style={{ backgroundColor: 'var(--bg-card)' }}
                    onMouseEnter={() => setOpenCategory(r.category)}
                    onMouseLeave={() => setOpenCategory(null)}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-theme-muted mb-2">
                      {meta.label} · {r.chats.length} de {r.count}
                    </div>
                    <ul className="space-y-1.5">
                      {r.chats.map((chat) => {
                        const url = buildChatUrl(chat.conversation_id)
                        const phone = chat.chat_external_id.split('@')[0]
                        const row = (
                          <div className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:surface-elevated transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-data text-theme-primary truncate">{phone}</div>
                              {chat.excerpt && (
                                <div className="text-[10px] text-theme-tertiary line-clamp-2 mt-0.5">
                                  {chat.excerpt}
                                </div>
                              )}
                            </div>
                            {url && (
                              <ExternalLink size={11} className="flex-shrink-0 mt-1" style={{ color: 'var(--accent-cyan)' }} />
                            )}
                          </div>
                        )
                        return (
                          <li key={chat.chat_external_id}>
                            {url ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                                {row}
                              </a>
                            ) : (
                              row
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
