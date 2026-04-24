import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Resolve o clientId ativo sem fazer chamadas independentes ao Supabase Auth.
// Antes, cada hook que usava useClientId () chamava supabase.auth.getUser() +
// query de validacao, competindo pelo auth lock com AuthContext.checkExistingSession.
// Isso gerava warnings 'Lock was not released within 5000ms' em producao,
// especialmente em pages que combinam varios hooks (Dashboard, Trafego, Relatorios).
//
// Agora consome o estado do AuthContext que ja carregou o profile uma vez:
//   - super admin + selectedClientId no localStorage  -> usa o override
//   - caso contrario usa clientProfile.id do usuario logado
//
// Nao revalida is_active: se o cliente esta inativo, queries RLS filtram
// naturalmente. Validacao eager aqui so adicionava latencia + lock contention.
export const useClientId = () => {
  const { clientProfile, isSuperAdmin, loading: authLoading } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const override = isSuperAdmin && typeof window !== 'undefined'
      ? localStorage.getItem('selectedClientId')
      : null;
    setClientId(override || clientProfile?.id || null);
  }, [authLoading, isSuperAdmin, clientProfile?.id]);

  return { clientId, loading: authLoading };
};
