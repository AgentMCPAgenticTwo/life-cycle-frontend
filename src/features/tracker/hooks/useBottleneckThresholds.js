import { useCallback, useEffect, useState } from 'react';
import { getBottleneckThresholds, updateBottleneckThresholds } from '@/services/trackerService';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Fetches the tenant-configured stuck-flag thresholds per stage (UC10-BR-002).
 * The endpoint is Tenant-Admin-only per its contract, so non-Tenant-Admin
 * roles skip the call entirely rather than receiving (and surfacing) a 403 --
 * the Stuck Flag value itself is still server-computed and shown to every
 * entitled role regardless.
 * A Tenant Admin may also edit the days per stage; `saveThresholds` persists
 * them and returns the saved list so callers can refresh the Stuck Flag.
 * @returns {{ thresholds: {stage: string, thresholdDays: number}[], canEdit: boolean, saveThresholds: (next: {stage: string, thresholdDays: number}[]) => Promise<{stage: string, thresholdDays: number}[]>, isSaving: boolean }}
 */
export function useBottleneckThresholds() {
  const { role } = useAuth();
  const [thresholds, setThresholds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (role !== 'TENANT_ADMIN') return;
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
  }, [role]);

  const saveThresholds = useCallback(async (next) => {
    setIsSaving(true);
    try {
      const response = await updateBottleneckThresholds(next);
      const saved = Array.isArray(response) ? response : response?.items || next;
      setThresholds(saved);
      return saved;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { thresholds, canEdit: role === 'TENANT_ADMIN', saveThresholds, isSaving };
}
