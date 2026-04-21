import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

const DISMISSED_KEY = 'pwa_notification_banner_dismissed'

export default function NotificationSetupBanner() {
  const { isSupported, isPWA, permission, isSubscribed, isLoading, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1')
  const [subscribing, setSubscribing] = useState(false)

  // Só mostra no PWA instalado, se suportado, não subscrito e não dispensado
  if (!isPWA || !isSupported || isSubscribed || dismissed || permission === 'denied' || isLoading) {
    return null
  }

  const handleEnable = async () => {
    setSubscribing(true)
    await subscribe()
    setSubscribing(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      className="flex items-center justify-between gap-4 px-6 py-3 border-b border-theme"
      style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 6%, var(--bg-card))' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)' }}
        >
          <Bell size={16} style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-theme-primary leading-tight">
            Ative as notificações
          </p>
          <p className="text-xs text-theme-secondary truncate">
            Receba alertas de vendas, agendamentos e novos clientes
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleDismiss}
          className="text-xs text-theme-secondary hover:text-theme-primary transition-colors px-2 py-1 rounded cursor-pointer"
        >
          Agora não
        </button>
        <button
          onClick={handleEnable}
          disabled={subscribing}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          style={{
            backgroundColor: 'var(--accent-cyan)',
            color: '#0a0a0f',
          }}
        >
          {subscribing ? 'Ativando...' : 'Habilitar'}
        </button>
        <button
          onClick={handleDismiss}
          className="text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
