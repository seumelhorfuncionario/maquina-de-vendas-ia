import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientId } from './useClientId';

export interface FunnelLabelConfig {
  id: string;
  client_id: string;
  label_name: string;
  visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useFunnelLabelConfig = () => {
  const { clientId } = useClientId();
  const [labelConfigs, setLabelConfigs] = useState<FunnelLabelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('funnel_label_config')
        .select('*')
        .eq('client_id', clientId)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setLabelConfigs((data as FunnelLabelConfig[]) || []);
    } catch (err) {
      console.error('Error fetching funnel label config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch config');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) fetchConfigs();
  }, [clientId, fetchConfigs]);

  return {
    labelConfigs,
    isLoading,
    error,
    refetch: fetchConfigs,
  };
};
