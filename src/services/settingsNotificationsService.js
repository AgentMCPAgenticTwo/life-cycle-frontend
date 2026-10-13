// Typed client for the `/api/v1/settings/notifications` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} NotificationEventResponse
 * @property {string} eventName
 * @property {boolean} emailToggle
 * @property {boolean} inAppToggle
 */

/**
 * @typedef {Object} UpdateNotificationEventRequest
 * @property {boolean} [emailToggle]
 * @property {boolean} [inAppToggle]
 */

/** @returns {Promise<NotificationEventResponse[]>} */
export function listNotificationEvents() {
  return http.get('/api/v1/settings/notifications');
}

/**
 * @param {string} eventName
 * @param {UpdateNotificationEventRequest} request
 * @returns {Promise<NotificationEventResponse>}
 */
export function updateNotificationEvent(eventName, request) {
  return http.put(`/api/v1/settings/notifications/${encodeURIComponent(eventName)}`, request);
}
