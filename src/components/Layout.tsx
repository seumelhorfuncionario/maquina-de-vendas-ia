import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

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
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-2.5 border-b border-theme" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 8%, var(--bg-card))' }}>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const toggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), [])

  return (
    <div className="min-h-screen surface-base">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <ViewingBanner />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
