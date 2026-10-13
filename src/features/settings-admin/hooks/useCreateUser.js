import { useCallback, useState } from 'react';
import { createUser } from '@/services/settingsUsersService';

/**
 * Creates a new tenant user (UC11-MF-001 / UC11-BR-002). The backend validates
 * email uniqueness within the tenant and returns an HttpError whose message is
 * the duplicate-email error to show verbatim (UC11-AF-002).
 * @returns {{ createUser: (request: import('@/services/settingsUsersService').CreateUserRequest) => Promise<import('@/services/settingsUsersService').UserListItemResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createUser(request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createUser: mutate, isLoading, error };
}
