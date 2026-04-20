import { RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import {
  useAIInsights,
  useDismissInsight,
  useGenerateInsights,
  useMarkInsightRead,
} from '@/hooks/useAIInsights'
import AIInsightCard from './AIInsightCard'

export default function AIInsightsSection() {
  const { data: insights, isLoading, error } = useAIInsights()
  const markRead = useMarkInsightRead()
  const dismiss = useDismissInsight()
  const generate = useGenerateInsights()

  const list = insights ?? []

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
            <Sparkles size={18} className="text-[color:var(--accent-cyan)]" />
            Insights da IA
          </h2>
          <p className="text-xs text-theme-tertiary mt-1">
            A IA analisa seus dados e encontra tendências, objeções, oportunidades e gargalos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-theme surface-card hover:brightness-110 transition disabled:opacity-60"
        >
          {generate.isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Gerando...
            </>
          ) : (
            <>
              <RefreshCw size={14} /> Gerar novos insights
            </>
          )}
        </button>
      </div>

      {generate.isError && (
        <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
          Não foi possível gerar insights agora. {generate.error instanceof Error ? generate.error.message : ''}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          Erro ao carregar insights.
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-theme surface-card p-5 h-44 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="rounded-2xl border border-theme surface-card p-10 text-center">
          <Sparkles size={28} className="mx-auto text-theme-muted mb-3" />
          <p className="text-sm text-theme-secondary font-medium">Nenhum insight gerado ainda</p>
          <p className="text-xs text-theme-tertiary mt-1.5 max-w-md mx-auto">
            Clique em "Gerar novos insights" para que a IA analise os dados das suas conversas dos últimos 30 dias.
          </p>
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {list.map((insight) => (
            <AIInsightCard
              key={insight.id}
              insight={insight}
              onMarkRead={(id) => markRead.mutate(id)}
              onDismiss={(id) => dismiss.mutate(id)}
              pending={markRead.isPending || dismiss.isPending}
            />
          ))}
        </div>
      )}
    </section>
  )
}
