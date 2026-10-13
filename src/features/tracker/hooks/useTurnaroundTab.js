import { getTurnaroundTab } from '@/services/trackerService';
import { useTrackerTabData } from '@/features/tracker/hooks/useTrackerTabData';

/**
 * Fetches Turnaround tab data (estimated vs actual turnaround, variance) (UC10-GC-004 / UC10-BR-003 / UC10-BR-004).
 * @param {import('@/services/trackerService').TrackerQueryParams} params
 * @returns {{ data: import('@/services/trackerService').TurnaroundTabResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useTurnaroundTab(params) {
  return useTrackerTabData(getTurnaroundTab, params);
}
