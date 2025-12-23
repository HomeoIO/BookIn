import { useEffect } from 'react';
import { useRegionStore } from '@stores/region-store';

export function useRegion() {
  const countryCode = useRegionStore((state) => state.countryCode);
  const source = useRegionStore((state) => state.source);
  const loading = useRegionStore((state) => state.loading);
  const fetchRegion = useRegionStore((state) => state.fetchRegion);

  useEffect(() => {
    fetchRegion();
  }, [fetchRegion]);

  return { countryCode, source, loading };
}
