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

  // Posicao calculada do popup quando aberto. Usa position:fixed pra escapar
  // overflow:hidden de ancestrais (o popup nunca mais e clipado pelo card pai
  // nem pela borda do viewport). Flip acima quando nao tiver espaco abaixo.
  const [popup, setPopup] = useState<{
    top: number
    right: number
    maxHeight: number
  } | null>(null)

  const openPopup = (category: LostReasonCategory, buttonEl: HTMLElement) => {
    const rect = buttonEl.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const gap = 8
    const preferredHeight = 360
    const spaceBelow = vh - rect.bottom - gap
    const spaceAbove = rect.top - gap
    // Escolhe o lado com mais espaco; maxHeight clampa ao disponivel.
    const flipAbove = spaceBelow < Math.min(200, preferredHeight) && spaceAbove > spaceBelow
    const maxHeight = Math.min(preferredHeight, flipAbove ? spaceAbove : spaceBelow)
    const top = flipAbove ? Math.max(gap, rect.top - gap - maxHeight) : rect.bottom + gap
    // Right-align com o botao, mas clampa 8px min do edge direito.
    const right = Math.max(8, vw - rect.right)
    setPopup({ top, right, maxHeight })
    setOpenCategory(category)
  }

  const closePopup = () => {
    setOpenCategory(null)
    setPopup(null)
  }

  // Fechar em scroll / resize -- fixed position nao acompanha o botao quando
  // o usuario rola, entao melhor fechar do que mostrar detachado.
  useEffect(() => {
    if (!openCategory) return
    const handler = () => closePopup()
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  }, [openCategory])

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
              <li
                key={r.category}
                className="relative"
                onMouseLeave={closePopup}
              >
                <button
                  type="button"
                  onClick={(e) => (isOpen ? closePopup() : openPopup(r.category, e.currentTarget))}
                  onMouseEnter={(e) => openPopup(r.category, e.currentTarget)}
                  className="w-full grid grid-cols-[140px_1fr_auto] gap-3 items-center text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] rounded-lg"
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

                {isOpen && r.chats.length > 0 && popup && (
                  <div
                    className="fixed z-[100] w-[min(380px,calc(100vw-1rem))] overflow-y-auto rounded-xl shadow-2xl p-3 ring-1 ring-[var(--accent-cyan)]/20"
                    style={{
                      top: popup.top,
                      right: popup.right,
                      maxHeight: popup.maxHeight,
                      backgroundColor: 'var(--bg-elevated, #1a1a1a)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                    }}
                    onMouseEnter={() => setOpenCategory(r.category)}
                    onMouseLeave={closePopup}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-widest mb-2.5 pb-2 border-b border-theme" style={{ color: `var(${meta.color})` }}>
                      {meta.label} · {r.chats.length} de {r.count}
                    </div>
                    <ul className="space-y-1.5">
                      {r.chats.map((chat) => {
                        const url = buildChatUrl(chat.conversation_id)
                        const phone = chat.chat_external_id.split('@')[0]
                        const row = (
                          <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--accent-cyan)_8%,transparent)] transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-data font-semibold text-theme-primary truncate">{phone}</div>
                              {chat.excerpt && (
                                <div className="text-[11px] text-theme-secondary line-clamp-2 mt-1 leading-snug">
                                  {chat.excerpt}
                                </div>
                              )}
                            </div>
                            {url && (
                              <ExternalLink size={12} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-cyan)' }} />
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
