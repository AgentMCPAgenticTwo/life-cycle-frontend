// Typed client for the `/api/v1/dashboard` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} DashboardSummaryResponse
 * @property {number} totalContractsCount
 * @property {number} inDraftCount
 * @property {number} inNegotiationCount
 * @property {number} pendingApprovalCount
 * @property {number} pendingSignatureCount
 * @property {number} executedCount
 * @property {number} expiring30DaysCount
 * @property {number} expiring60DaysCount
 * @property {number} expiring90DaysCount
 * @property {string|null} [noContractsMessage]
 * @property {string|null} [noMatchMessage]
 */

/**
 * @typedef {Object} MyTaskItemResponse
 * @property {string} contractId
 * @property {string} contractName
 * @property {string} counterparty
 * @property {string} status
 * @property {string} dueDate
 */

/**
 * @typedef {Object} MyTasksResponse
 * @property {MyTaskItemResponse[]} items
 * @property {string|null} [emptyMessage]
 */

/**
 * @typedef {Object} HighRiskContractResponse
 * @property {string} contractId
 * @property {string} contractName
 * @property {string} counterparty
 * @property {number} riskScore
 */

/**
 * @typedef {Object} HighRiskContractsResponse
 * @property {HighRiskContractResponse[]} items
 * @property {string|null} [emptyMessage]
 */

/**
 * @typedef {Object} DashboardFilterOptionsResponse
 * @property {string[]} contractTypes
 * @property {string[]} departments
 * @property {{id: string, name: string}[]} counterparties
 * @property {{id: string, name: string}[]} owners
 */

/**
 * Builds the query string shared by the dashboard endpoints from the
 * dashboardFilterSlice's applied filter values. Only includes params that are
 * actually set, so untouched filters are never sent.
 * @param {object} filters
 */
function buildDashboardQuery(filters = {}) {
  const params = new URLSearchParams();
  const { contractType, department, counterpartyId, ownerId, dateRangeStart, dateRangeEnd } = filters;

  if (contractType) params.set('contractType', contractType);
  if (department) params.set('department', department);
  if (counterpartyId) params.set('counterpartyId', counterpartyId);
  if (ownerId) params.set('ownerId', ownerId);
  if (dateRangeStart) params.set('dateRangeStart', dateRangeStart);
  if (dateRangeEnd) params.set('dateRangeEnd', dateRangeEnd);

  return params.toString();
}

/** @returns {Promise<DashboardSummaryResponse>} */
export function getDashboardSummary(filters = {}) {
  const query = buildDashboardQuery(filters);
  return http.get(`/api/v1/dashboard/summary${query ? `?${query}` : ''}`);
}

/** @returns {Promise<MyTasksResponse>} */
export function getMyTasks(filters = {}) {
  const query = buildDashboardQuery(filters);
  return http.get(`/api/v1/dashboard/my-tasks${query ? `?${query}` : ''}`);
}

/** @returns {Promise<HighRiskContractsResponse>} */
export function getHighRiskContracts(filters = {}) {
  const query = buildDashboardQuery(filters);
  return http.get(`/api/v1/dashboard/high-risk-contracts${query ? `?${query}` : ''}`);
}

/** @returns {Promise<DashboardFilterOptionsResponse>} */
export function getDashboardFilterOptions() {
  return http.get('/api/v1/dashboard/filters');
}
