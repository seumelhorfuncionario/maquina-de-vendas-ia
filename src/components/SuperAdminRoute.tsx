import { Navigate } from 'react-router-dom'
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin'
import type { ReactNode } from 'react'

export default function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isSuperAdmin, loading } = useIsSuperAdmin()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050505' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Verificando permissoes...</span>
        </div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
