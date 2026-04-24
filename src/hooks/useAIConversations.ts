import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/types/database'

export type AIConversationMessage = Database['public']['Tables']['assistant_conversations']['Row']
export type AIConversationRole = 'user' | 'assistant'

function resolveClientId(clientProfileId: string | null | undefined, isSuperAdmin: boolean): string | null {
  if (isSuperAdmin && typeof window !== 'undefined') {
    const selected = localStorage.getItem('selectedClientId')
    if (selected) return selected
  }
  return clientProfileId ?? null
}

interface UseAIConversationsOptions {
  limit?: number
  conversationId?: string | null
}

export function useAIConversations(options: UseAIConversationsOptions = {}) {
  const { clientProfile, isSuperAdmin } = useAuth()
  const clientId = resolveClientId(clientProfile?.id, isSuperAdmin)
  const { limit = 40, conversationId = null } = options

  return useQuery<AIConversationMessage[]>({
    queryKey: ['assistant_conversations', clientId, conversationId, limit],
    enabled: !!clientId,
    staleTime: 30_000,
    queryFn: async () => {
      let query = supabase
        .from('assistant_conversations')
        .select('*')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (conversationId) {
        query = query.eq('conversation_id', conversationId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []).reverse()
    },
  })
}
