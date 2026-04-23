import { useState } from 'react'
import { CalendarCheck, ExternalLink, Receipt, Loader2, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DateRangePicker, { defaultRange } from '../components/DateRangePicker'
import { useAgentsData } from '@/hooks/useAgentsData'
import { useSync } from '@/hooks/useSync'

export default function Agendamentos() {
  const [range, setRange] = useState(() => defaultRange(7))
  const { sync, syncing } = useSync()

  const agents = useAgentsData({
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  })

  const loading = agents.loading

  return (
    <div>
      <PageHeader
        title="Agendamentos"
        description="Todos os agendamentos confirmados pela IA no período"
        action={
          <div className="flex items-center gap-2">
            <DateRangePicker value={range} onChange={setRange} />
            <button
              onClick={async () => { await sync(); agents.refetch?.() }}
              disabled={syncing}
              aria-label="Sincronizar com CRM"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#00D4FF10] text-[#00D4FF] border border-[#00D4FF25] hover:bg-[#00D4FF20] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        }
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
          <span className="ml-3 text-sm text-theme-muted">Carregando agendamentos...</span>
        </div>
      )}

      {!loading && agents.agendamentos.length === 0 && (
        <div className="rounded-2xl border border-theme surface-card p-12 text-center">
          <CalendarCheck size={32} className="mx-auto mb-3 text-theme-muted" />
          <p className="text-sm text-theme-muted">Nenhum agendamento no período selecionado.</p>
        </div>
      )}

      {!loading && agents.agendamentos.length > 0 && (
        <div className="rounded-2xl border border-theme surface-card p-6 animate-card-in relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-cyan) 15%, transparent), transparent)' }}
          />
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="text-base font-bold text-theme-primary tracking-tight">Lista de Agendamentos</h2>
            <span
              className="text-[11px] font-bold font-data px-2 py-0.5 rounded-md"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)', color: 'var(--accent-cyan)' }}
            >
              {agents.agendamentosCount}
            </span>
          </div>
          <div className="space-y-2">
            {agents.agendamentos.map(ag => {
              const date = new Date(ag.data_inicio)
              const isPast = date < new Date()
              const chatUrl = ag.conversation_id && agents.cwBaseUrl && agents.cwAccountId
                ? `${agents.cwBaseUrl}/app/accounts/${agents.cwAccountId}/conversations/${ag.conversation_id}`
                : null
              return (
                <div
                  key={ag.id}
                  className={`flex items-center justify-between rounded-xl surface-card-hover border border-theme px-4 py-3 ${isPast ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: 'var(--bg-card-hover)' }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[11px] font-data w-[90px] flex-shrink-0" style={{ color: 'var(--accent-cyan)' }}>
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-theme-primary truncate">{ag.nome_cliente}</span>
                      {ag.telefone_cliente && (
                        <span className="text-[11px] font-data truncate" style={{ color: 'var(--text-tertiary)' }}>
                          {ag.telefone_cliente}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className="text-[11px] text-[#666] truncate max-w-[200px] hidden lg:block">{ag.procedimento}</span>
                    {chatUrl && (
                      <a
                        href={chatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir chat no Chatwoot"
                        className="p-1 rounded-md transition-colors hover:opacity-80"
                        style={{ color: 'var(--accent-cyan)' }}
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {ag.comprovante_url && (
                      <a
                        href={ag.comprovante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver comprovante"
                        className="p-1 rounded-md transition-colors hover:opacity-80"
                        style={{ color: 'var(--accent-green)' }}
                      >
                        <Receipt size={13} />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
