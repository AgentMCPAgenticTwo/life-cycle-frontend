// Typed client for the `/api/v1/settings/users` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} UserListItemResponse
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} status
 * @property {string|null} [lastLogin]
 */

/**
 * @typedef {Object} CreateUserRequest
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/** @returns {Promise<{items: UserListItemResponse[], totalCount: number, page: number, pageSize: number}>} */
export function listTenantUsers() {
  return http.get('/api/v1/settings/users');
}

/**
 * @param {CreateUserRequest} request
 * @returns {Promise<UserListItemResponse>}
 */
export function createUser(request) {
  return http.post('/api/v1/settings/users', request);
}

/**
 * @typedef {Object} UpdateUserStatusRequest
 * @property {'Invited'|'Active'|'Deactivated'} status
 */

/**
 * @param {string} userId
 * @param {UpdateUserStatusRequest} request
 * @returns {Promise<UserListItemResponse>}
 */
export function updateUserStatus(userId, request) {
  return http.patch(`/api/v1/settings/users/${userId}/status`, request);
}
