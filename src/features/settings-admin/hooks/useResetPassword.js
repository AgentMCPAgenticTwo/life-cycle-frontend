import { useCallback, useState } from 'react';
import { resetUserPassword } from '@/services/settingsUsersService';

/**
 * Issues a new temporary password for a user (TENANT_ADMIN only). The
 * backend sets must_change_password and revokes that user's refresh tokens;
 * the generated password is returned once and must be shown to the admin.
 * @returns {{ resetPassword: (userId: string) => Promise<{temporaryPassword: string}>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetPassword = useCallback(async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resetUserPassword(userId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { resetPassword, isLoading, error };
}
