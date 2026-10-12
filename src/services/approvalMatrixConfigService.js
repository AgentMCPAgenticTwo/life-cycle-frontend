// Typed client for the `/api/v1/approval-matrix-config` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} ApprovalMatrixStepConfig
 * @property {number} stepNumber
 * @property {string} [approverRole]
 * @property {string} [approverUserId]
 * @property {string} stepName
 */

/**
 * @typedef {Object} ApprovalMatrixConfigResponse
 * @property {string} id
 * @property {string} contractType
 * @property {number} [valueMin]
 * @property {number} [valueMax]
 * @property {number} [riskBandMin]
 * @property {number} [riskBandMax]
 * @property {ApprovalMatrixStepConfig[]} steps
 */

/**
 * @typedef {Object} ApprovalMatrixConfigListResponse
 * @property {ApprovalMatrixConfigResponse[]} items
 */

/**
 * @typedef {Object} UpdateApprovalMatrixConfigRequest
 * @property {ApprovalMatrixConfigResponse[]} items
 */

/** @returns {Promise<ApprovalMatrixConfigListResponse>} */
export function listApprovalMatrixConfig() {
  return http.get('/api/v1/approval-matrix-config');
}

/** @returns {Promise<ApprovalMatrixConfigListResponse>} */
export function updateApprovalMatrixConfig(request) {
  return http.put('/api/v1/approval-matrix-config', request);
}
