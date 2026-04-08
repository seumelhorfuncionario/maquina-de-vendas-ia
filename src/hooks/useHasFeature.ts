import { useClientFeatures } from './useClientFeatures';

export const useHasFeature = (featureKey: string) => {
  const { hasFeature, loading } = useClientFeatures();

  return {
    hasAccess: hasFeature(featureKey),
    loading,
  };
};
