import { useCallback, useState } from 'react';
import { exportTrackerTab } from '@/services/trackerService';

const GENERIC_FAILURE_MESSAGE = 'Export failed. Please try again.';

/**
 * Triggers a Tracker export and surfaces failure without disturbing the
 * caller's current view (UC10-AF-004 / UC10-MF-001): the on-screen filters,
 * tab selection and table data are owned by the caller and never touched here.
 * @returns {{ exportTab: (request: import('@/services/trackerService').TrackerExportRequest) => Promise<{success: boolean, fileUrl?: string|null}>, isExporting: boolean, failureMessage: string|null, clearFailure: () => void }}
 */
export function useTrackerExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [failureMessage, setFailureMessage] = useState(null);

  const exportTab = useCallback(async (request) => {
    setIsExporting(true);
    setFailureMessage(null);
    try {
      const response = await exportTrackerTab(request);
      if (!response.success) {
        setFailureMessage(response.failureMessage || GENERIC_FAILURE_MESSAGE);
        return response;
      }
      return response;
    } catch {
      setFailureMessage(GENERIC_FAILURE_MESSAGE);
      return { success: false };
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportTab, isExporting, failureMessage, clearFailure: () => setFailureMessage(null) };
}
