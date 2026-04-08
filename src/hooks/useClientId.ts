import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClientId = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientId();
  }, []);

  const getClientId = async () => {
    try {
      const selectedClientId = localStorage.getItem('selectedClientId');

      if (selectedClientId) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('id, is_active')
          .eq('id', selectedClientId)
          .single();

        if (clientData && clientData.is_active) {
          setClientId(selectedClientId);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem('selectedClientId');
        }
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('clients')
          .select('id')
          .eq('auth_user_id', user.id)
          .eq('is_active', true)
          .single();

        if (data) {
          setClientId(data.id);
        }
      }
    } catch (error) {
      console.error('Error getting client ID:', error);
    } finally {
      setLoading(false);
    }
  };

  return { clientId, loading };
};
