import { useState, useEffect } from 'react';
import { getDeviceId } from '@/utils/device-id';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeviceId().then((id) => {
      setDeviceId(id);
      setLoading(false);
    });
  }, []);

  return { deviceId, loading };
}
