import { useEffect, useState } from 'react';
import { listFolderTagOptions } from '@/services/contractRepositoryService';

/**
 * Fetches folder/tag options for the Folder/Tag Filter and the Add Folder/Tag dialog.
 * @returns {{ data: import('@/services/contractRepositoryService').FolderTagOptionResponse[], isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useFolderTagOptions() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    listFolderTagOptions()
      .then((response) => {
        if (!cancelled) setData(Array.isArray(response) ? response : response?.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
