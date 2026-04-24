import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// check_user_role e RPC distinta de super_admins -- pode ter outras roles (ex: agente).
// Mantemos o RPC mas removemos supabase.auth.getUser() independente: consumimos
// o user do AuthContext (se tiver) e so disparamos o RPC quando o auth acabou de
// carregar. Isso evita lock contention com o checkExistingSession do AuthContext.
export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase.rpc('check_user_role').then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin((data as any)?.is_admin || false);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  return { isAdmin, loading };
};
