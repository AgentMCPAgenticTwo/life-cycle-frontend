// Typed client for the `/api/v1/approvals` resource group. GET /api/v1/approvals
// (the list endpoint) belongs to ApprovalsListPage; detail, actions, delegation
// and history belong to ApprovalReviewPage. See CLAUDE.md: one service module
// per resource group, calling exactly the paths/DTOs declared in the module
// contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} ApprovalResponse
 * @property {string} id
 * @property {string} contractId
 * @property {string} contractTitle
 * @property {string} contractType
 * @property {number} contractValue
 * @property {string} counterpartyName
 * @property {string} [keyTermsSummary]
 * @property {string} [deviationsFromStandard]
 * @property {number} [aiRiskScore]
 * @property {string} approvalMatrixStepLabel
 * @property {number} approvalMatrixStepNumber
 * @property {number} approvalMatrixTotalSteps
 * @property {'PendingApproval'|'Approved'|'Rejected'|'SentBack'} status
 * @property {string} [comments]
 * @property {string} [delegateToUserId]
 * @property {string} [delegateToName]
 * @property {string} [delegationStartDate]
 * @property {string} [delegationEndDate]
 * @property {string} currentApproverId
 * @property {string} currentApproverName
 * @property {boolean} isCurrentUserApprover
 * @property {boolean} isCurrentUserActiveDelegate
 * @property {boolean} isStepActionable
 * @property {boolean} canApprove
 * @property {boolean} canReject
 * @property {boolean} canSendBack
 * @property {boolean} canDelegate
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ApprovalActionRequest
 * @property {'Approve'|'Reject'|'SendBack'} actionType
 * @property {string} [comments]
 */

/**
 * @typedef {Object} ApprovalActionResponse
 * @property {string} approvalId
 * @property {'PendingApproval'|'Approved'|'Rejected'|'SentBack'} status
 * @property {string} approvalMatrixStepLabel
 * @property {number} approvalMatrixStepNumber
 * @property {'InNegotiation'|'PendingApproval'|'PendingSignature'|'Rejected'} contractStatus
 */

/**
 * @typedef {Object} DelegateRequest
 * @property {string} delegateToUserId
 * @property {string} startDate
 * @property {string} endDate
 */

/**
 * @typedef {Object} DelegateResponse
 * @property {string} id
 * @property {string} approvalId
 * @property {string} delegateToUserId
 * @property {string} delegateToName
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} createdBy
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ApprovalHistoryEntryResponse
 * @property {string} id
 * @property {string} approvalId
 * @property {string} contractTitle
 * @property {string} contractType
 * @property {number} contractValue
 * @property {string} counterpartyName
 * @property {string} [keyTermsSummary]
 * @property {string} [deviationsFromStandard]
 * @property {number} [aiRiskScore]
 * @property {string} approvalMatrixStepLabel
 * @property {'Approve'|'Reject'|'SendBack'|'Delegate'} action
 * @property {string} actorId
 * @property {string} actorName
 * @property {string} actorRole
 * @property {string} [actingAsDelegateForUserId]
 * @property {string} [delegateToUserId]
 * @property {string} [delegateToName]
 * @property {string} priorState
 * @property {string} newState
 * @property {string} [comments]
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ApprovalHistoryListResponse
 * @property {ApprovalHistoryEntryResponse[]} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalCount
 */

/**
 * @typedef {Object} ApprovalListItemResponse
 * @property {string} id
 * @property {string} contractId
 * @property {string} contractTitle
 * @property {string} contractType
 * @property {number} contractValue
 * @property {string} counterpartyName
 * @property {string} [keyTermsSummary]
 * @property {string} [deviationsFromStandard]
 * @property {number} [aiRiskScore]
 * @property {string} approvalMatrixStepLabel
 * @property {'PendingApproval'|'Approved'|'Rejected'|'SentBack'} status
 */

/**
 * @typedef {Object} ApprovalListResponse
 * @property {ApprovalListItemResponse[]} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalCount
 * @property {boolean} isEmpty
 * @property {string} [emptyMessage]
 */

/** @returns {Promise<ApprovalListResponse>} */
export function listApprovals() {
  return http.get('/api/v1/approvals');
}

/** @returns {Promise<ApprovalResponse>} */
export function getApproval(approvalId) {
  return http.get(`/api/v1/approvals/${approvalId}`);
}

/** @returns {Promise<ApprovalActionResponse>} */
export function submitApprovalAction(approvalId, request) {
  return http.post(`/api/v1/approvals/${approvalId}/actions`, request);
}

/** @returns {Promise<DelegateResponse>} */
export function delegateApproval(approvalId, request) {
  return http.post(`/api/v1/approvals/${approvalId}/delegate`, request);
}

/** @returns {Promise<ApprovalHistoryListResponse>} */
export function getApprovalHistory(approvalId) {
  return http.get(`/api/v1/approvals/${approvalId}/history`);
}
