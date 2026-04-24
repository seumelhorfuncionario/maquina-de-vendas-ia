import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import TopNav from './TopNav'
import AIChatWidget from './ai/AIChatWidget'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { usePushNotifications } from '@/hooks/usePushNotifications'

function ViewingBanner() {
  const navigate = useNavigate()
  const { isSuperAdmin } = useAuth()
  const [clientName, setClientName] = useState<string | null>(null)
  const selectedId = localStorage.getItem('selectedClientId')

  useEffect(() => {
    if (!isSuperAdmin || !selectedId) return
    supabase
      .from('clients')
      .select('business_name')
      .eq('id', selectedId)
      .single()
      .then(({ data }) => {
        if (data) setClientName(data.business_name)
      })
  }, [isSuperAdmin, selectedId])

  if (!isSuperAdmin || !selectedId || !clientName) return null

  const handleBack = () => {
    localStorage.removeItem('selectedClientId')
    navigate('/super-admin/clients')
  }

  return (
    <div className="sticky top-14 z-30 flex items-center justify-between px-6 py-2.5 border-b border-theme" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 8%, var(--bg-card))' }}>
      <div className="flex items-center gap-3">
        <Eye size={16} style={{ color: 'var(--accent-cyan)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--accent-cyan)' }}>
          Visualizando: <strong className="text-theme-primary">{clientName}</strong>
        </span>
      </div>
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        style={{ color: 'var(--accent-cyan)' }}
      >
        <ArrowLeft size={14} />
        Voltar ao Admin
      </button>
    </div>
  )
}

export default function Layout() {
  const { hasFeature } = useTenant()
  usePushNotifications() // auto-solicita permissão em PWA na primeira abertura

  return (
    <div className="min-h-screen surface-base">
      <TopNav />
      <ViewingBanner />
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
        <Outlet />
      </main>
      {hasFeature('ai_assistant') && <AIChatWidget />}
    </div>
  )
}
