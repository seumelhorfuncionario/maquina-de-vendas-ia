import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { TenantProvider } from '../contexts/TenantContext'
import { DataProvider } from '../contexts/DataContext'
import { supabase } from '@/integrations/supabase/client'
import TopNav from '../components/TopNav'

const PAGES = {
  dashboard: lazy(() => import('./Dashboard')),
  agendamentos: lazy(() => import('./Agendamentos')),
  // alias legado: URLs antigas com ?page=relatorios continuam funcionando apontando pro Dashboard novo
  relatorios: lazy(() => import('./Dashboard')),
  leads: lazy(() => import('./Leads')),
  vendas: lazy(() => import('./Vendas')),
  producao: lazy(() => import('./Producao')),
  financeiro: lazy(() => import('./Financeiro')),
  produtos: lazy(() => import('./Produtos')),
  ia: lazy(() => import('./IAVision')),
  trafego: lazy(() => import('./Trafego')),
  criativos: lazy(() => import('./Criativos')),
  'meus-tickets': lazy(() => import('./MeusTickets')),
  'gestao-ia': lazy(() => import('./GestaoIA')),
} as const

type EmbedPage = keyof typeof PAGES

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'var(--bg-base)' }}>
      <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent-cyan)' }} />
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}

function DeniedBlock({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-base)' }}>
      <div
        className="max-w-md text-center rounded-2xl p-8"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid color-mix(in srgb, var(--accent-red) 25%, transparent)',
        }}
      >
        <AlertTriangle size={32} style={{ color: 'var(--accent-red)' }} className="mx-auto mb-3" />
        <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Acesso negado
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{reason}</p>
      </div>
    </div>
  )
}

export default function EmbedView() {
  const { clientId } = useParams<{ clientId: string }>()
  const [searchParams] = useSearchParams()
  const requestedPage = (searchParams.get('page') ?? 'dashboard') as EmbedPage
  const page: EmbedPage = requestedPage in PAGES ? requestedPage : 'dashboard'
  const chrome = searchParams.get('chrome') ?? 'full' // 'full' | 'none' | 'banner-only'

  const { isAuthenticated, isSuperAdmin, clientProfile, loading: authLoading } = useAuth()
  const [clientExists, setClientExists] = useState<boolean | null>(null)

  // Auto-login: (1) via ?token= embed_token ou (2) sem token quando Origin e trusted
  // (edge function `embed-session` valida via CORS Origin contra whitelist SMF).
  const embedToken = searchParams.get('token')
  const [tokenExchanging, setTokenExchanging] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || isAuthenticated || !clientId || tokenExchanging) return

    // Auto-login sem token so quando em iframe -- impede que qualquer pessoa com a URL
    // /embed/{clientId} em browser standalone entre direto na conta do cliente.
    // Com token, funciona em qualquer contexto (URL privada por cliente).
    const inIframe = typeof window !== 'undefined' && window.top !== window.self
    if (!embedToken && !inIframe) return

    setTokenExchanging(true)

    const exchange = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
        if (!supabaseUrl || !anonKey) throw new Error('Supabase env missing')

        const body: Record<string, string> = { client_id: clientId }
        if (embedToken) body.token = embedToken

        const res = await fetch(`${supabaseUrl}/functions/v1/embed-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: anonKey },
          body: JSON.stringify(body),
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`)

        const { error } = await supabase.auth.verifyOtp({
          token_hash: payload.token_hash,
          type: 'magiclink',
        })
        if (error) throw error
        // onAuthStateChange in AuthContext will pick up the session
      } catch (err) {
        setTokenError(err instanceof Error ? err.message : 'Falha ao autenticar embed')
      } finally {
        setTokenExchanging(false)
      }
    }

    exchange()
  }, [authLoading, isAuthenticated, embedToken, clientId, tokenExchanging])

  const allowed =
    isAuthenticated && !!clientId && (isSuperAdmin || clientProfile?.id === clientId)

  useEffect(() => {
    if (!isSuperAdmin || !clientId) return
    localStorage.setItem('selectedClientId', clientId)
  }, [isSuperAdmin, clientId])

  useEffect(() => {
    if (!clientId || !allowed) return
    let active = true
    supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        setClientExists(!!data)
      })
    return () => {
      active = false
    }
  }, [clientId, allowed])

  if (authLoading) return <LoadingBlock label="Carregando sessão..." />
  if (tokenExchanging) return <LoadingBlock label="Autenticando..." />
  if (tokenError) return <DeniedBlock reason={`Token de embed inválido: ${tokenError}`} />
  if (!isAuthenticated) return <DeniedBlock reason="Faça login antes de abrir este painel." />
  if (!allowed) return <DeniedBlock reason="Você não tem permissão para visualizar esse cliente." />
  if (clientExists === false) return <DeniedBlock reason="Cliente não encontrado ou inativo." />

  const PageComponent = PAGES[page]
  const showTopNav = chrome === 'full'

  return (
    <TenantProvider>
      <DataProvider>
        <div className="min-h-screen surface-base">
          {showTopNav && <TopNav embed />}
          <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
            <Suspense fallback={<LoadingBlock label="Carregando painel..." />}>
              <PageComponent />
            </Suspense>
          </main>
        </div>
      </DataProvider>
    </TenantProvider>
  )
}
