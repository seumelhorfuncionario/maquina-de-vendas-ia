import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'

interface FeatureGuardProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  showLockedMessage?: boolean
}

export function FeatureGuard({
  feature,
  children,
  fallback,
  showLockedMessage = true,
}: FeatureGuardProps) {
  const { hasFeature, loading } = useTenant()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-sm text-neutral-500">Carregando...</span>
      </div>
    )
  }

  if (!hasFeature(feature)) {
    if (fallback) return <>{fallback}</>

    if (showLockedMessage) {
      return (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full" style={{ backgroundColor: '#111' }}>
              <Lock className="w-8 h-8 text-neutral-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white mb-2">
                Recurso nao disponivel
              </h3>
              <p className="text-neutral-500 text-sm">
                Esta funcionalidade nao esta incluida no seu plano atual.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return <>{children}</>
}
