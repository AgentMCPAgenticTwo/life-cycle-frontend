import { getBottleneckTab } from '@/services/trackerService';
import { useTrackerTabData } from '@/features/tracker/hooks/useTrackerTabData';

/**
 * Fetches Bottleneck tab data (current stage, days in stage, stuck flag) (UC10-GC-003 / UC10-BR-002).
 * @param {import('@/services/trackerService').TrackerQueryParams} params
 * @returns {{ data: import('@/services/trackerService').BottleneckTabResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useBottleneckTab(params) {
  return useTrackerTabData(getBottleneckTab, params);
}
