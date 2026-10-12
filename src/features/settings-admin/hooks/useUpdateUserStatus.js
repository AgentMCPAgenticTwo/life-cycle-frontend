import { useCallback, useState } from 'react';
import { updateUserStatus } from '@/services/settingsUsersService';

/**
 * Updates a user's status (deactivate/reactivate), per UC11-BR-003 /
 * UC11-BR-014 / UC11-BR-015. The backend blocks removing the last active
 * Tenant Admin and surfaces that as a thrown HttpError.
 * @returns {{ updateStatus: (userId: string, request: import('@/services/settingsUsersService').UpdateUserStatusRequest) => Promise<import('@/services/settingsUsersService').UserListItemResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useUpdateUserStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = useCallback(async (userId, request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await updateUserStatus(userId, request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateStatus, isLoading, error };
}
