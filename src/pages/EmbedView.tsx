import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { TenantProvider } from '../contexts/TenantContext'
import { DataProvider } from '../contexts/DataContext'
import { supabase } from '@/integrations/supabase/client'

const PAGES = {
  dashboard: lazy(() => import('./Dashboard')),
  leads: lazy(() => import('./Leads')),
  vendas: lazy(() => import('./Vendas')),
  producao: lazy(() => import('./Producao')),
  financeiro: lazy(() => import('./Financeiro')),
  produtos: lazy(() => import('./Produtos')),
  ia: lazy(() => import('./IAVision')),
  trafego: lazy(() => import('./Trafego')),
  criativos: lazy(() => import('./Criativos')),
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
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="max-w-md text-center rounded-2xl p-8"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid color-mix(in srgb, var(--accent-red) 25%, transparent)',
        }}
      >
        <AlertTriangle
          size={32}
          style={{ color: 'var(--accent-red)' }}
          className="mx-auto mb-3"
        />
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

  const { isAuthenticated, isSuperAdmin, clientProfile, loading: authLoading } = useAuth()
  const [clientExists, setClientExists] = useState<boolean | null>(null)

  // Super-admin or the owner-client can view
  const allowed =
    isAuthenticated && !!clientId && (isSuperAdmin || clientProfile?.id === clientId)

  useEffect(() => {
    if (!isSuperAdmin || !clientId) return
    // When a super-admin opens an embed for a specific client, we set the tenant
    // so TenantContext + DataProvider load that client's features/data.
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
        if (active) setClientExists(!!data)
      })
    return () => {
      active = false
    }
  }, [clientId, allowed])

  if (authLoading) return <LoadingBlock label="Carregando sessão..." />
  if (!isAuthenticated) return <DeniedBlock reason="Faça login antes de abrir este painel." />
  if (!allowed) return <DeniedBlock reason="Você não tem permissão para visualizar esse cliente." />
  if (clientExists === false) return <DeniedBlock reason="Cliente não encontrado ou inativo." />

  const PageComponent = PAGES[page]

  return (
    <TenantProvider>
      <DataProvider>
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
          <Suspense fallback={<LoadingBlock label="Carregando painel..." />}>
            <div className="p-6">
              <PageComponent />
            </div>
          </Suspense>
        </div>
      </DataProvider>
    </TenantProvider>
  )
}
