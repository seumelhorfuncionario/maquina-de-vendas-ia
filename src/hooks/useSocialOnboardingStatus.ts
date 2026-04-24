import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

function resolveClientId(clientProfileId: string | null | undefined, isSuperAdmin: boolean): string | null {
  if (isSuperAdmin && typeof window !== 'undefined') {
    const selected = localStorage.getItem('selectedClientId')
    if (selected) return selected
  }
  return clientProfileId ?? null
}

export interface SocialOnboardingStatus {
  completed: boolean
  completedAt: string | null
  clientId: string | null
}

export function useSocialOnboardingStatus() {
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)

  return useQuery<SocialOnboardingStatus>({
    queryKey: ['social_onboarding_status', clientId],
    enabled: !!clientId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('clients')
        .select('dashboard_config')
        .eq('id', clientId!)
        .maybeSingle()

      const cfg = (data?.dashboard_config as Record<string, unknown> | null) || {}
      const onboarding = (cfg.social_onboarding as Record<string, unknown> | undefined) || {}
      const completedAt = typeof onboarding.completedAt === 'string' ? onboarding.completedAt : null

      return { completed: !!completedAt, completedAt, clientId }
    },
  })
}

export function useInvalidateSocialOnboarding() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['social_onboarding_status'] })
}
