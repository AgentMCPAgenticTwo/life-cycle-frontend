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

/**
 * Edits an existing approval rule. Approvals already in progress keep the
 * routing they were created with — the backend owns that guarantee.
 * @param {string} ruleId
 * @param {CreateApprovalRuleRequest} request
 * @returns {Promise<ApprovalRuleResponse>}
 */
export function updateApprovalRule(ruleId, request) {
  return http.put(`/api/v1/settings/approval-rules/${ruleId}`, request);
}

/**
 * Deletes an approval rule; approvals already in progress are unaffected.
 * @param {string} ruleId
 * @returns {Promise<void>}
 */
export function deleteApprovalRule(ruleId) {
  return http.del(`/api/v1/settings/approval-rules/${ruleId}`);
}
