import { useEffect, useState } from 'react';
import { getDashboardFilterOptions } from '@/services/dashboardService';

/**
 * Populates the Contract Type Filter and Owner Filter dropdowns from the
 * tenant's real lookup data (UC10-FV-001: "the tenant's configured contract
 * types/users"). This module's own contract has no tracker-specific options
 * endpoint, so this reuses the already-built dashboard filters lookup
 * (GET /api/v1/dashboard/filters) rather than inventing a new URL -- see this
 * task's blockers for the judgement call.
 * @returns {{ contractTypes: string[], owners: {id: string, name: string}[], isLoading: boolean }}
 */
export function useTrackerFilterOptions() {
  const [contractTypes, setContractTypes] = useState([]);
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDashboardFilterOptions()
      .then((response) => {
        if (cancelled) return;
        setContractTypes(response.contractTypes || []);
        setOwners(response.owners || []);
      })
      .catch(() => {
        if (!cancelled) {
          setContractTypes([]);
          setOwners([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { contractTypes, owners, isLoading };
}
