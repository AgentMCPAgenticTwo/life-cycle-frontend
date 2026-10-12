import { useCallback, useState } from 'react';
import { assignFolderTags } from '@/services/contractRepositoryService';

/**
 * Assigns one or more folders/tags to a contract via the Add Folder/Tag dialog (UC8-FV-004).
 * @param {string} contractId
 * @returns {{ assign: (ids: string[]) => Promise<import('@/services/contractRepositoryService').FolderTagOptionResponse[]>, isSaving: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useAssignFolderTag(contractId) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const assign = useCallback(
    async (folderTagIds) => {
      setIsSaving(true);
      setError(null);
      try {
        const response = await assignFolderTags(contractId, { folderTagIds });
        return response.folderTags;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [contractId]
  );

  return { assign, isSaving, error };
}
