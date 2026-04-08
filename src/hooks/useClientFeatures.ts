import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientId } from './useClientId';

export interface Feature {
  feature_key: string;
  feature_name: string;
  description: string | null;
  category: string | null;
  is_enabled: boolean;
}

export const useClientFeatures = (clientIdOverride?: string) => {
  const { clientId: hookClientId } = useClientId();
  const clientId = clientIdOverride || hookClientId;

  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      fetchClientFeatures();
    }
  }, [clientId]);

  const fetchClientFeatures = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('client_features_view' as any)
        .select('*')
        .eq('client_id', clientId);

      if (fetchError) {
        console.error('Error fetching client features:', fetchError);
        setError(fetchError.message);
        setFeatures([]);
      } else {
        setFeatures((data as any) || []);
      }
    } catch (err) {
      console.error('Error fetching client features:', err);
      setError('Failed to fetch features');
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    const feature = features.find(f => f.feature_key === featureKey);
    return feature?.is_enabled ?? false;
  };

  const getFeature = (featureKey: string): Feature | undefined => {
    return features.find(f => f.feature_key === featureKey);
  };

  return {
    features,
    loading,
    error,
    hasFeature,
    getFeature,
    refetch: fetchClientFeatures,
  };
};
