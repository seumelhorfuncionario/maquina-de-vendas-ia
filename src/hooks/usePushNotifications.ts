import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

interface PushNotificationState {
  isSupported: boolean
  isPWA: boolean
  permission: NotificationPermission | 'unsupported'
  isSubscribed: boolean
  isLoading: boolean
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<void>
}

export function usePushNotifications(): PushNotificationState {
  const { user, clientProfile } = useAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supported = 'PushManager' in window && 'serviceWorker' in navigator && 'Notification' in window
    setIsSupported(supported)

    const pwa = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    setIsPWA(pwa)

    if (supported) {
      setPermission(Notification.permission)
      checkSubscription()
    } else {
      setIsLoading(false)
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      setIsSubscribed(!!existing)
    } catch {
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) return false

    setIsLoading(true)
    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') return false

      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) throw new Error('VAPID public key não configurada')

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      const subJson = subscription.toJSON()
      const tenantId = clientProfile?.id ?? user.id

      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          tenant_id: tenantId,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh ?? '',
          auth: subJson.keys?.auth ?? '',
          is_active: true,
        }, { onConflict: 'user_id,endpoint' })

      if (error) throw error

      setIsSubscribed(true)
      return true
    } catch (err) {
      console.error('Erro ao subscrever notificações:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, user, clientProfile])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        const authUser = (await supabase.auth.getUser()).data.user
        if (authUser) {
          await supabase
            .from('push_subscriptions' as any)
            .update({ is_active: false })
            .eq('user_id', authUser.id)
            .eq('endpoint', subscription.endpoint)
        }
        await subscription.unsubscribe()
      }

      setIsSubscribed(false)
      setPermission('default')
    } catch (err) {
      console.error('Erro ao cancelar notificações:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isSupported, isPWA, permission, isSubscribed, isLoading, subscribe, unsubscribe }
}
