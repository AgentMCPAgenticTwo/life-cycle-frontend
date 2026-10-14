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
 * @property {string} [initialPassword] - leave empty to have the backend auto-generate one
 */

/**
 * @typedef {UserListItemResponse & {temporaryPassword?: string}} CreateUserResponse
 * temporaryPassword is only ever present on this one response — the backend
 * never returns it again on later reads, so it must be shown to the admin now.
 */

/** @returns {Promise<{items: UserListItemResponse[], totalCount: number, page: number, pageSize: number}>} */
export function listTenantUsers() {
  return http.get('/api/v1/settings/users');
}

/**
 * @param {CreateUserRequest} request
 * @returns {Promise<CreateUserResponse>}
 */
export function createUser(request) {
  return http.post('/api/v1/settings/users', request);
}

/**
 * @param {string} userId
 * @returns {Promise<{temporaryPassword: string}>}
 */
export function resetUserPassword(userId) {
  return http.post(`/api/v1/settings/users/${userId}/reset-password`);
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
