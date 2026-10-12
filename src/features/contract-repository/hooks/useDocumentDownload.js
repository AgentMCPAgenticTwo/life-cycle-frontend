import { useCallback, useState } from 'react';
import { getDocumentDownload } from '@/services/contractRepositoryService';

const RETRIEVAL_ERROR = 'This document could not be retrieved. Please contact your administrator.';

/**
 * Triggers document download and surfaces retrieval errors (UC8-AF-005, UC8-BR-006).
 * @param {string} contractId
 * @returns {{ download: () => void, error: string, isDownloading: boolean }}
 */
export function useDocumentDownload(contractId) {
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(() => {
    if (!contractId) return;
    setError('');
    setIsDownloading(true);
    getDocumentDownload(contractId)
      .then((response) => {
        if (response.success && response.fileUrl) {
          const link = document.createElement('a');
          link.href = response.fileUrl;
          link.rel = 'noopener';
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          setError(response.errorMessage || RETRIEVAL_ERROR);
        }
      })
      .catch(() => setError(RETRIEVAL_ERROR))
      .finally(() => setIsDownloading(false));
  }, [contractId]);

  return { download, error, isDownloading };
}
