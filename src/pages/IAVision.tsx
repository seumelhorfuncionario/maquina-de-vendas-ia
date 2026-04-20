import { useQuery } from '@tanstack/react-query'
import { Sparkles, MessageCircle, Bell, Calendar } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import AIInsightsSection from '../components/ai/AIInsightsSection'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'

function resolveClientId(clientProfileId: string | null | undefined, isSuperAdmin: boolean): string | null {
  if (clientProfileId) return clientProfileId
  if (isSuperAdmin && typeof window !== 'undefined') {
    return localStorage.getItem('selectedClientId')
  }
  return null
}

interface AIStats {
  unreadInsights: number
  totalInsights30d: number
  chatMessages30d: number
  lastInsightAt: string | null
}

function useAIStats() {
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)

  return useQuery<AIStats>({
    queryKey: ['ai_stats', clientId],
    enabled: !!clientId,
    staleTime: 60_000,
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [unreadRes, totalRes, chatRes, lastRes] = await Promise.all([
        supabase
          .from('ai_insights')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId!)
          .eq('dismissed', false)
          .eq('is_read', false),
        supabase
          .from('ai_insights')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId!)
          .gte('created_at', since),
        supabase
          .from('assistant_conversations')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId!)
          .eq('role', 'user')
          .gte('created_at', since),
        supabase
          .from('ai_insights')
          .select('created_at')
          .eq('client_id', clientId!)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      return {
        unreadInsights: unreadRes.count ?? 0,
        totalInsights30d: totalRes.count ?? 0,
        chatMessages30d: chatRes.count ?? 0,
        lastInsightAt: lastRes.data?.created_at ?? null,
      }
    },
  })
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'há minutos'
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `há ${days}d`
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function IAVision() {
  const { data: stats } = useAIStats()

  return (
    <div>
      <PageHeader
        title="Converse com sua IA"
        description="Insights automáticos e chat com o funcionário que conhece sua operação"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Insights não lidos"
          value={stats?.unreadInsights ?? '—'}
          icon={<Bell size={18} />}
          color={stats && stats.unreadInsights > 0 ? 'warning' : 'neutral'}
          subtitle="aguardando sua atenção"
        />
        <StatCard
          title="Insights (30d)"
          value={stats?.totalInsights30d ?? '—'}
          icon={<Sparkles size={18} />}
          color="positive"
          subtitle="gerados automaticamente"
        />
        <StatCard
          title="Mensagens no chat"
          value={stats?.chatMessages30d ?? '—'}
          icon={<MessageCircle size={18} />}
          color="neutral"
          subtitle="nos últimos 30 dias"
        />
        <StatCard
          title="Último insight"
          value={formatRelative(stats?.lastInsightAt ?? null)}
          icon={<Calendar size={18} />}
          color="neutral"
          subtitle="análise mais recente"
        />
      </div>

      <AIInsightsSection />

      <div className="rounded-2xl border border-theme surface-card p-6">
        <h3 className="text-sm font-semibold text-theme-primary mb-2 flex items-center gap-2">
          <MessageCircle size={16} className="text-[color:var(--accent-cyan)]" />
          Converse com seu funcionário de IA
        </h3>
        <p className="text-sm text-theme-secondary leading-relaxed">
          O botão de chat no canto da tela abre seu assistente pessoal. Ele conhece seus dados de atendimento,
          suas etiquetas do CRM e seu contexto de negócio — pergunte coisas como
          <em className="text-theme-tertiary"> "quais leads mais me trazem venda?"</em> ou
          <em className="text-theme-tertiary"> "o que está travando meus agendamentos?"</em>.
        </p>
      </div>
    </div>
  )
}
