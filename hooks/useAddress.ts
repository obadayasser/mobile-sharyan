import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { formatGeocode } from '@/hooks/useLocation';

const cache = new Map<string, string | null>();

export function useAddress(latitude?: number | null, longitude?: number | null) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setAddress(null);
      return;
    }
    const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    if (cache.has(key)) {
      setAddress(cache.get(key) ?? null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        const formatted = formatGeocode(geo[0]) ?? null;
        cache.set(key, formatted);
        if (!cancelled) setAddress(formatted);
      } catch {
        cache.set(key, null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return address;
}
