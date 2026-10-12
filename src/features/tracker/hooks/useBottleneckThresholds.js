import { useEffect, useState } from 'react';
import { getBottleneckThresholds } from '@/services/trackerService';
import { authHeaders } from '@/services/http';

/**
 * Fetches the tenant-configured stuck-flag thresholds per stage (UC10-BR-002).
 * The endpoint is Tenant-Admin-only per its contract, so non-Tenant-Admin
 * roles skip the call entirely rather than receiving (and surfacing) a 403 --
 * the Stuck Flag value itself is still server-computed and shown to every
 * entitled role regardless.
 * @returns {{ thresholds: {stage: string, thresholdDays: number}[] }}
 */
export function useBottleneckThresholds() {
  const [thresholds, setThresholds] = useState([]);

  useEffect(() => {
    if (authHeaders.role !== 'TENANT_ADMIN') return;
    let cancelled = false;
    getBottleneckThresholds()
      .then((response) => {
        if (!cancelled) setThresholds(Array.isArray(response) ? response : response?.items || []);
      })
      .catch(() => {
        if (!cancelled) setThresholds([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { thresholds };
}
