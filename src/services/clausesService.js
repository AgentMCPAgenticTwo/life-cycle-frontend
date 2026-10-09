// Typed client for the `/api/v1/clauses` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} ClauseResponse
 * @property {string} id
 * @property {string} clauseName
 * @property {string} clauseCategory
 * @property {string} standardText
 * @property {string} [fallbackText1]
 * @property {string} [fallbackText2]
 * @property {string} riskLevel
 * @property {boolean} mandatory
 * @property {string} status
 * @property {string} lastModifiedBy
 * @property {string} lastModifiedDate
 */

/**
 * @typedef {Object} ClauseListResponse
 * @property {ClauseResponse[]} items
 */

/**
 * @typedef {Object} CreateClauseRequest
 * @property {string} clauseName
 * @property {string} clauseCategory
 * @property {string} standardText
 * @property {string} [fallbackText1]
 * @property {string} [fallbackText2]
 * @property {string} riskLevel
 * @property {boolean} mandatory
 */

/**
 * @typedef {Object} UpdateClauseRequest
 * @property {string} clauseName
 * @property {string} clauseCategory
 * @property {string} standardText
 * @property {string} [fallbackText1]
 * @property {string} [fallbackText2]
 * @property {string} riskLevel
 * @property {boolean} mandatory
 */

/**
 * @typedef {Object} VersionHistoryItemResponse
 * @property {number} versionNumber
 * @property {string} changedBy
 * @property {string} dateChanged
 * @property {string} [changeSummary]
 */

/**
 * @typedef {Object} VersionHistoryResponse
 * @property {VersionHistoryItemResponse[]} items
 */

/** @returns {Promise<ClauseListResponse>} */
export function listClauses() {
  return http.get('/api/v1/clauses');
}

/** @returns {Promise<ClauseResponse>} */
export function createClause(request) {
  return http.post('/api/v1/clauses', request);
}

/** @returns {Promise<ClauseResponse>} */
export function updateClause(id, request) {
  return http.put(`/api/v1/clauses/${id}`, request);
}

/** @returns {Promise<ClauseResponse>} */
export function deactivateClause(id) {
  return http.post(`/api/v1/clauses/${id}/deactivate`);
}

/** @returns {Promise<ClauseResponse>} */
export function reactivateClause(id) {
  return http.post(`/api/v1/clauses/${id}/reactivate`);
}

/** @returns {Promise<VersionHistoryResponse>} */
export function getClauseVersions(id) {
  return http.get(`/api/v1/clauses/${id}/versions`);
}
