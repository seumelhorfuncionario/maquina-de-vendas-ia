import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
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
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-2.5 bg-[#00D4FF15] border-b border-[#00D4FF30]">
      <div className="flex items-center gap-3">
        <Eye size={16} className="text-[#00D4FF]" />
        <span className="text-sm text-[#00D4FF] font-medium">
          Visualizando: <strong className="text-white">{clientName}</strong>
        </span>
      </div>
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#00D4FF] hover:bg-[#00D4FF15] transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar ao Admin
      </button>
    </div>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Sidebar />
      <div className="ml-[260px] transition-all duration-300">
        <ViewingBanner />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
