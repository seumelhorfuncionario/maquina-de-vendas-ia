import { useState, useEffect } from 'react'
import { Bell, BellOff, DollarSign, Calendar, UserPlus, Settings } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useNotificationPrefs, type NotificationPrefs } from '@/hooks/useNotificationPrefs'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? '' : 'bg-neutral-700'
      }`}
      style={checked ? { backgroundColor: 'var(--accent-cyan)' } : {}}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function NotificationPreferences() {
  const { isSupported, isPWA, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications()
  const { prefs, isLoading: prefsLoading, savePrefs, isSaving } = useNotificationPrefs()
  const [localPrefs, setLocalPrefs] = useState<NotificationPrefs>(prefs)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalPrefs(prefs)
  }, [prefs])

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-theme p-4 bg-neutral-800/40">
        <p className="text-sm text-theme-secondary">
          Seu navegador não suporta notificações push.
        </p>
      </div>
    )
  }

  if (!isPWA) {
    return (
      <div className="rounded-xl border border-theme p-4 bg-neutral-800/40">
        <p className="text-sm text-theme-secondary">
          Instale o app via <strong className="text-theme-primary">Adicionar à tela inicial</strong> para habilitar notificações.
        </p>
      </div>
    )
  }

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  const handlePrefChange = (key: keyof NotificationPrefs, value: boolean) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    await savePrefs(localPrefs)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const prefItems: Array<{ key: keyof NotificationPrefs; label: string; icon: React.ElementType; description: string }> = [
    { key: 'notify_venda', label: 'Nova Venda', icon: DollarSign, description: 'Quando uma venda for registrada' },
    { key: 'notify_agendamento', label: 'Novo Agendamento', icon: Calendar, description: 'Quando um agendamento for criado' },
    { key: 'notify_novo_cliente', label: 'Novo Cliente', icon: UserPlus, description: 'Quando um novo cliente for cadastrado' },
    { key: 'notify_producao', label: 'Atualização de Produção', icon: Settings, description: 'Quando o status de uma ordem mudar' },
  ]

  return (
    <div className="rounded-xl border border-theme overflow-hidden">
      {/* Header — toggle principal */}
      <div className="flex items-center justify-between p-4 border-b border-theme" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)' }}
          >
            {isSubscribed
              ? <Bell size={16} style={{ color: 'var(--accent-cyan)' }} />
              : <BellOff size={16} className="text-neutral-400" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-theme-primary">Notificações Push</p>
            <p className="text-xs text-theme-secondary">
              {isSubscribed ? 'Ativas neste dispositivo' : 'Desativadas neste dispositivo'}
            </p>
          </div>
        </div>
        <Toggle
          checked={isSubscribed}
          onChange={handleToggleSubscription}
          disabled={isLoading || permission === 'denied'}
        />
      </div>

      {permission === 'denied' && (
        <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
          <p className="text-xs text-red-400">
            Permissão negada pelo navegador. Habilite manualmente nas configurações do browser.
          </p>
        </div>
      )}

      {/* Preferências individuais */}
      {isSubscribed && (
        <>
          <div className="divide-y divide-theme" style={{ backgroundColor: 'var(--bg-base)' }}>
            {prefItems.map(({ key, label, icon: Icon, description }) => (
              <div key={key} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon size={15} className="text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-theme-primary">{label}</p>
                    <p className="text-xs text-theme-secondary">{description}</p>
                  </div>
                </div>
                <Toggle
                  checked={localPrefs[key]}
                  onChange={(v) => handlePrefChange(key, v)}
                  disabled={prefsLoading}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-theme" style={{ backgroundColor: 'var(--bg-card)' }}>
            {saved && <span className="text-xs" style={{ color: 'var(--accent-green)' }}>Salvo!</span>}
            <button
              onClick={handleSave}
              disabled={isSaving || prefsLoading}
              className="text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent-cyan)', color: '#0a0a0f' }}
            >
              {isSaving ? 'Salvando...' : 'Salvar preferências'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
