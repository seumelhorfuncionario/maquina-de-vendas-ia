import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { TenantProvider } from '../contexts/TenantContext'
import { DataProvider } from '../contexts/DataContext'
import { supabase } from '@/integrations/supabase/client'
import Sidebar from '../components/Sidebar'

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
  'meus-tickets': lazy(() => import('./MeusTickets')),
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

function EmbedBanner({ clientName }: { clientName: string | null }) {
  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-2.5 border-b border-theme"
      style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 8%, var(--bg-card))' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent-cyan)' }}>
          Modo embed
        </span>
        {clientName && (
          <span className="text-sm text-theme-primary font-semibold">{clientName}</span>
        )}
      </div>
      <button
        onClick={() => window.close()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
        style={{ color: 'var(--accent-cyan)' }}
      >
        <ArrowLeft size={14} />
        Fechar
      </button>
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
  const [clientName, setClientName] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), [])

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
      .select('id, business_name')
      .eq('id', clientId)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        setClientExists(!!data)
        setClientName(data?.business_name ?? null)
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
  const showSidebar = chrome === 'full'
  const showBanner = chrome !== 'none'
  const mainMargin = showSidebar ? (sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]') : 'ml-0'

  return (
    <TenantProvider>
      <DataProvider>
        <div className="min-h-screen surface-base">
          {showSidebar && <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />}
          <div className={`transition-all duration-300 ${mainMargin}`}>
            {showBanner && <EmbedBanner clientName={clientName} />}
            <main className="p-8">
              <Suspense fallback={<LoadingBlock label="Carregando painel..." />}>
                <PageComponent />
              </Suspense>
            </main>
          </div>
        </div>
      </DataProvider>
    </TenantProvider>
  )
}
