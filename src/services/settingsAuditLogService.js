// Typed client for the `/api/v1/settings/audit-log` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} AuditLogQueryParams
 * @property {string} [filterDateRangeFrom]
 * @property {string} [filterDateRangeTo]
 * @property {string} [userFilter]
 * @property {string} [actionTypeFilter]
 * @property {number} [page]
 * @property {number} [pageSize]
 */

/**
 * @typedef {Object} AuditLogEntryResponse
 * @property {string} id
 * @property {string} logDateTime
 * @property {string} logUser
 * @property {string} logAction
 * @property {string} logEntity
 * @property {string|null} [details]
 */

/**
 * @param {AuditLogQueryParams} params
 * @returns {Promise<{items: AuditLogEntryResponse[], totalCount: number, page: number, pageSize: number}>}
 */
export function listAuditLog(params = {}) {
  const query = new URLSearchParams();
  if (params.filterDateRangeFrom) query.set('filterDateRangeFrom', params.filterDateRangeFrom);
  if (params.filterDateRangeTo) query.set('filterDateRangeTo', params.filterDateRangeTo);
  if (params.userFilter) query.set('userFilter', params.userFilter);
  if (params.actionTypeFilter) query.set('actionTypeFilter', params.actionTypeFilter);
  const qs = query.toString();
  return http.get(`/api/v1/settings/audit-log${qs ? `?${qs}` : ''}`);
}
