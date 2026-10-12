// Typed client for the `/api/v1/settings/approval-rules` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} ApprovalRuleResponse
 * @property {string} id
 * @property {string} contractType
 * @property {number} valueThreshold
 * @property {string} approverRole
 */

/**
 * @typedef {Object} CreateApprovalRuleRequest
 * @property {string} contractType
 * @property {number} valueThreshold
 * @property {string} approverRole
 */

/** @returns {Promise<{items: ApprovalRuleResponse[], totalCount: number, page: number, pageSize: number}>} */
export function listApprovalRules() {
  return http.get('/api/v1/settings/approval-rules');
}

/**
 * @param {CreateApprovalRuleRequest} request
 * @returns {Promise<ApprovalRuleResponse>}
 */
export function createApprovalRule(request) {
  return http.post('/api/v1/settings/approval-rules', request);
}
