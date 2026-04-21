import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface NotificationPrefs {
  notify_venda: boolean
  notify_agendamento: boolean
  notify_novo_cliente: boolean
  notify_producao: boolean
}

const DEFAULT_PREFS: NotificationPrefs = {
  notify_venda: true,
  notify_agendamento: true,
  notify_novo_cliente: true,
  notify_producao: true,
}

export function useNotificationPrefs() {
  const { user, clientProfile } = useAuth()
  const queryClient = useQueryClient()

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['push_notification_prefs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser.user) return DEFAULT_PREFS

      const { data, error } = await supabase
        .from('push_notification_prefs' as any)
        .select('notify_venda, notify_agendamento, notify_novo_cliente, notify_producao')
        .eq('user_id', authUser.user.id)
        .maybeSingle()

      if (error) throw error
      return (data as NotificationPrefs | null) ?? DEFAULT_PREFS
    },
  })

  const { mutateAsync: savePrefs, isPending: isSaving } = useMutation({
    mutationFn: async (newPrefs: NotificationPrefs) => {
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser.user) throw new Error('Não autenticado')

      const tenantId = clientProfile?.id ?? user?.id ?? ''

      const { error } = await supabase
        .from('push_notification_prefs' as any)
        .upsert({
          user_id: authUser.user.id,
          tenant_id: tenantId,
          ...newPrefs,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push_notification_prefs', user?.id] })
    },
  })

  return {
    prefs: prefs ?? DEFAULT_PREFS,
    isLoading,
    savePrefs,
    isSaving,
  }
}
