import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationResult {
  latitude: number;
  longitude: number;
  address?: string;
}

export function formatGeocode(parts: Location.LocationGeocodedAddress | undefined) {
  if (!parts) return undefined;
  const pieces = [
    parts.district,
    parts.city || parts.subregion,
    parts.region,
  ].filter(Boolean) as string[];
  // Dedupe consecutive identical pieces (some locales repeat city/region).
  const unique = pieces.filter((p, i) => p !== pieces[i - 1]);
  return unique.length ? unique.join(', ') : undefined;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('locationPermission');
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const result: LocationResult = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      try {
        const geo = await Location.reverseGeocodeAsync(result);
        result.address = formatGeocode(geo[0]);
      } catch {
        // best-effort — no address is fine
      }
      setLocation(result);
      return result;
    } catch {
      setError('locationError');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, error, requestLocation };
}
