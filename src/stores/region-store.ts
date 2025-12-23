import { create } from 'zustand';

interface RegionState {
  countryCode: string | null;
  source: 'geo' | 'locale' | null;
  loading: boolean;
  fetchRegion: () => Promise<void>;
}

const regionEndpoints = [
  'https://ipapi.co/json/',
  'https://ipwho.is/'
];

const CACHE_KEY = 'bookin-region';
const isBrowser = typeof window !== 'undefined';

export const useRegionStore = create<RegionState>((set, get) => ({
  countryCode: null,
  source: null,
  loading: false,

  fetchRegion: async () => {
    if (!isBrowser) return;
    if (get().countryCode) return;

    // Check cache (valid for 24h)
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.countryCode && parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          console.debug(
            '[region] using cached region',
            parsed.countryCode,
            `source=${parsed.source || 'geo'}`
          );
          set({ countryCode: parsed.countryCode, source: parsed.source || 'geo' });
          return;
        }
      } catch (err) {
        console.warn('Failed to parse region cache', err);
      }
    }

    set({ loading: true });
    let resolved: { countryCode: string; source: 'geo' | 'locale' } | null = null;

    for (const endpoint of regionEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) continue;
        const data = await response.json();
        const code = (data.country_code || data.country || data.countryCode || '').toString().slice(0, 2).toUpperCase();
        if (code) {
          resolved = { countryCode: code, source: 'geo' };
          console.debug('[region] geo match', code, `via ${endpoint}`);
          break;
        }
      } catch (error) {
        console.warn('Geo lookup failed', error);
      }
    }

    if (!resolved) {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || 'en-US';
      const inferredCountry = locale.split('-')[1] || 'US';
      resolved = { countryCode: inferredCountry.toUpperCase(), source: 'locale' };
      console.debug('[region] fallback to locale', resolved.countryCode);
    }

    set({ countryCode: resolved.countryCode, source: resolved.source, loading: false });
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ ...resolved, timestamp: Date.now() }));
    console.debug('[region] final region set', resolved.countryCode, `source=${resolved.source}`);
  }
}));
