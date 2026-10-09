// Typed client for the `/api/v1/users` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} UserOptionResponse
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} UserOptionListResponse
 * @property {UserOptionResponse[]} items
 */

/**
 * Returns tenant users filtered by role, used to populate the Contract Owner
 * dropdown (UC2-BR-003 / UC2-BR-012).
 * @returns {Promise<UserOptionListResponse>}
 */
export function listUsers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set('role', filters.role);
  return http.get(`/api/v1/users${params.toString() ? `?${params}` : ''}`);
}
