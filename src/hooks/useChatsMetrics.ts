import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientId } from './useClientId';

interface ChatsMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  qualificationRate: number;
  loading: boolean;
  error: string | null;
}

export const useChatsMetrics = () => {
  const { clientId, loading: clientLoading } = useClientId();
  const [metrics, setMetrics] = useState<ChatsMetrics>({
    totalLeads: 0,
    qualifiedLeads: 0,
    qualificationRate: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (clientLoading) return;
    if (!clientId) {
      setMetrics(prev => ({ ...prev, loading: false, error: 'Client ID not found' }));
      return;
    }

    fetchMetrics();
  }, [clientId, clientLoading]);

  const fetchMetrics = async () => {
    try {
      setMetrics(prev => ({ ...prev, loading: true, error: null }));

      const { count: totalCount, error: totalError } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId!);

      if (totalError) throw totalError;

      const { count: qualifiedCount, error: qualifiedError } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId!)
        .ilike('tags', '%Qualificado%');

      if (qualifiedError) throw qualifiedError;

      const total = totalCount || 0;
      const qualified = qualifiedCount || 0;
      const rate = total > 0 ? (qualified / total) * 100 : 0;

      setMetrics({
        totalLeads: total,
        qualifiedLeads: qualified,
        qualificationRate: rate,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching chats metrics:', error);
      setMetrics(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
      }));
    }
  };

  return metrics;
};
