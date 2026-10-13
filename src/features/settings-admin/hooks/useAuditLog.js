import { useCallback, useEffect, useRef, useState } from 'react';
import { listAuditLog } from '@/services/settingsAuditLogService';

/**
 * Fetches the read-only audit log entries for the Audit Log Tab, re-querying
 * whenever the applied filter changes (UC11-FV-005 / UC11-GC-003). The
 * backend sorts newest first; this hook never mutates or deletes entries
 * (UC11-AF-006 / UC11-BR-005 / UC11-BR-011).
 * @param {import('@/services/settingsAuditLogService').AuditLogQueryParams} filter
 * @returns {{ data: import('@/services/settingsAuditLogService').AuditLogEntryResponse[]|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useAuditLog(filter = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listAuditLog(filter)
      .then((response) => {
        if (requestId.current === id) setData(response.items || []);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [filter.filterDateRangeFrom, filter.filterDateRangeTo, filter.userFilter, filter.actionTypeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
