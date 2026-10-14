// Typed client for the `/auth` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} AuthUserResponse
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} tenantId
 * @property {boolean} mustChangePassword
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} accessToken
 * @property {AuthUserResponse} user
 */

/**
 * @param {{email: string, password: string}} request
 * @returns {Promise<LoginResponse>}
 */
export function login(request) {
  return http.post('/auth/login', request);
}

/** @returns {Promise<void>} */
export function logout() {
  return http.post('/auth/logout');
}

/** @returns {Promise<AuthUserResponse>} */
export function getCurrentUser() {
  return http.get('/auth/me');
}

/**
 * @param {{currentPassword: string, newPassword: string}} request
 * @returns {Promise<void>}
 */
export function changePassword(request) {
  return http.post('/auth/change-password', request);
}
