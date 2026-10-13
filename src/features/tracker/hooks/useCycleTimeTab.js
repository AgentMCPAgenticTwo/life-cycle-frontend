import { getCycleTimeTab } from '@/services/trackerService';
import { useTrackerTabData } from '@/features/tracker/hooks/useTrackerTabData';

/**
 * Fetches Cycle Time tab data (average cycle time per stage) (UC10-GC-002 / UC10-BR-001).
 * @param {import('@/services/trackerService').TrackerQueryParams} params
 * @returns {{ data: import('@/services/trackerService').CycleTimeTabResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useCycleTimeTab(params) {
  return useTrackerTabData(getCycleTimeTab, params);
}
