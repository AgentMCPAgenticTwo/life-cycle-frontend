import { useCallback, useState } from 'react';
import { getDocumentDownload } from '@/services/contractRepositoryService';
import { downloadAndSave } from '@/shared/utils/fileDownload';

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
        if (!response.success || !response.fileUrl) {
          setError(response.errorMessage || RETRIEVAL_ERROR);
          return undefined;
        }
        // `fileUrl` is served by the API behind the auth header, so pointing an
        // <a href> at it just navigates the SPA and nothing is downloaded.
        const fallbackName = response.fileUrl.split('/').pop() || 'contract-document';
        return downloadAndSave(response.fileUrl, fallbackName);
      })
      .catch(() => setError(RETRIEVAL_ERROR))
      .finally(() => setIsDownloading(false));
  }, [contractId]);

  return { download, error, isDownloading };
}
