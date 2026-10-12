import { getOwnershipTab } from '@/services/trackerService';
import { useTrackerTabData } from '@/features/tracker/hooks/useTrackerTabData';

/**
 * Fetches Ownership tab data (Contracts by Owner) (UC10-GC-001).
 * @param {import('@/services/trackerService').TrackerQueryParams} params
 * @returns {{ data: import('@/services/trackerService').OwnershipTabResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useOwnershipTab(params) {
  return useTrackerTabData(getOwnershipTab, params);
}
