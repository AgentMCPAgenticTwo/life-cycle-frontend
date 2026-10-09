// Typed client for the `/api/v1/lifecycle` Negotiation & Routing (UC5) resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

const BASE = '/api/v1/lifecycle';

/**
 * @typedef {Object} ReviewerResponse
 * @property {string} reviewerId
 * @property {string} reviewerName
 * @property {string} [role]
 * @property {boolean} isMandatory
 * @property {('Pending'|'Submitted'|'Overdue')} reviewStatus
 * @property {string} [submittedAt]
 * @property {number} [sequenceOrder]
 */

/**
 * @typedef {Object} RoutingRequest
 * @property {('Sequential'|'Parallel')} routingType
 * @property {string[]} internalReviewers
 * @property {string} externalPartyName
 * @property {string} externalPartyEmail
 * @property {string} assignedDate
 * @property {string} dueDate
 */

/**
 * @typedef {Object} RoutingResponse
 * @property {string} contractId
 * @property {('Sequential'|'Parallel')} routingType
 * @property {ReviewerResponse[]} internalReviewers
 * @property {string} externalPartyName
 * @property {string} externalPartyEmail
 * @property {string} assignedDate
 * @property {string} dueDate
 * @property {('With Internal'|'With Counterparty'|'Agreed')} negotiationStatus
 * @property {number} versionNumber
 */

/** @returns {Promise<RoutingResponse>} */
export function submitRouting(contractId, request) {
  return http.post(`${BASE}/contracts/${contractId}/negotiation/routing`, request);
}

/**
 * @typedef {Object} VersionSummaryResponse
 * @property {number} versionNumber
 * @property {string} createdAt
 * @property {string} createdBy
 * @property {('Internal'|'External')} source
 */

/**
 * @typedef {Object} CommentResponse
 * @property {string} commentId
 * @property {string} [clauseId]
 * @property {string} commentText
 * @property {string} authorName
 * @property {string} createdAt
 * @property {number} versionNumber
 */

/**
 * @typedef {Object} NegotiationTrackerResponse
 * @property {string} contractId
 * @property {('Sequential'|'Parallel')} routingType
 * @property {ReviewerResponse[]} internalReviewers
 * @property {string} externalPartyName
 * @property {string} externalPartyEmail
 * @property {string} assignedDate
 * @property {string} dueDate
 * @property {('With Internal'|'With Counterparty'|'Agreed')} negotiationStatus
 * @property {number} versionNumber
 * @property {boolean} overdueFlag
 * @property {VersionSummaryResponse[]} versions
 * @property {CommentResponse[]} comments
 */

/** @returns {Promise<NegotiationTrackerResponse>} */
export function getNegotiationTracker(contractId) {
  return http.get(`${BASE}/contracts/${contractId}/negotiation`);
}

/**
 * @typedef {Object} SubmitReviewRequest
 * @property {string} [commentText]
 * @property {string} [redlineText]
 */

/**
 * @typedef {Object} SubmitReviewResponse
 * @property {number} versionNumber
 * @property {('With Internal'|'With Counterparty'|'Agreed')} negotiationStatus
 */

/** @returns {Promise<SubmitReviewResponse>} */
export function submitReview(contractId, request) {
  return http.post(`${BASE}/contracts/${contractId}/negotiation/reviews`, request);
}

/**
 * @typedef {Object} GenerateExternalLinkResponse
 * @property {string} linkToken
 * @property {string} expiresAt
 * @property {('Active'|'Expired'|'Locked')} status
 */

/** @returns {Promise<GenerateExternalLinkResponse>} */
export function generateExternalLink(contractId) {
  return http.post(`${BASE}/contracts/${contractId}/negotiation/external-link`);
}

/**
 * @typedef {Object} ClauseDiffResponse
 * @property {string} [clauseId]
 * @property {string} [clauseCategory]
 * @property {string} [textA]
 * @property {string} [textB]
 * @property {('Added'|'Deleted'|'Modified'|'Unchanged')} changeType
 */

/**
 * @typedef {Object} CompareVersionsResponse
 * @property {VersionSummaryResponse} versionA
 * @property {VersionSummaryResponse} versionB
 * @property {ClauseDiffResponse[]} differences
 * @property {CommentResponse[]} comments
 * @property {('With Internal'|'With Counterparty'|'Agreed')} negotiationStatus
 * @property {('Sequential'|'Parallel')} routingType
 * @property {ReviewerResponse[]} internalReviewers
 * @property {string} externalPartyName
 * @property {string} externalPartyEmail
 * @property {string} assignedDate
 * @property {string} dueDate
 */

/**
 * versionA/versionB are sent as query params so the Version A/B Selectors (DP-UC5-012/013)
 * can request a specific pair — inferred, since the module contract documents this GET with
 * no request DTO. See T-NEGOTIATION-TRACKER-PAGE-UI blockers.
 * @returns {Promise<CompareVersionsResponse>}
 */
export function compareVersions(contractId, versionA, versionB) {
  const params = new URLSearchParams();
  if (versionA != null) params.set('versionA', versionA);
  if (versionB != null) params.set('versionB', versionB);
  const query = params.toString();
  return http.get(`${BASE}/contracts/${contractId}/negotiation/compare${query ? `?${query}` : ''}`);
}

/**
 * @typedef {Object} ReminderResponse
 * @property {string} sentTo
 * @property {string} sentAt
 * @property {('Automatic'|'Manual')} reminderType
 */

/** @returns {Promise<ReminderResponse>} */
export function sendReminder(contractId) {
  return http.post(`${BASE}/contracts/${contractId}/negotiation/reminder`);
}

/**
 * @typedef {Object} MarkAgreedResponse
 * @property {'Agreed'} negotiationStatus
 * @property {number} versionNumber
 * @property {('Sequential'|'Parallel')} routingType
 * @property {ReviewerResponse[]} internalReviewers
 * @property {string} externalPartyName
 * @property {string} externalPartyEmail
 * @property {string} assignedDate
 * @property {string} dueDate
 */

/** @returns {Promise<MarkAgreedResponse>} */
export function markAgreed(contractId) {
  return http.post(`${BASE}/contracts/${contractId}/negotiation/mark-agreed`);
}

/**
 * @typedef {Object} CommentRequest
 * @property {string} [clauseId]
 * @property {string} commentText
 */

/** @returns {Promise<CommentResponse>} */
export function addComment(contractId, request) {
  return http.post(`${BASE}/contracts/${contractId}/negotiation/comments`, request);
}

/**
 * @typedef {Object} VerifyOtpRequest
 * @property {string} otp
 */

/**
 * @typedef {Object} NegotiationExternalViewResponse
 * @property {string} contractId
 * @property {number} versionNumber
 * @property {string} documentText
 * @property {boolean} commentBoxEnabled
 */

/**
 * @typedef {Object} VerifyOtpResponse
 * @property {boolean} verified
 * @property {NegotiationExternalViewResponse} [negotiationData]
 */

/** @returns {Promise<VerifyOtpResponse>} */
export function verifyOtp(linkToken, request) {
  return http.post(`${BASE}/negotiation/external/${linkToken}/verify-otp`, request);
}

/**
 * @typedef {Object} ExternalSubmitRequest
 * @property {string} [commentText]
 * @property {string} redlineText
 */

/**
 * @typedef {Object} ExternalSubmitResponse
 * @property {number} versionNumber
 * @property {string} negotiationStatus
 */

/** @returns {Promise<ExternalSubmitResponse>} */
export function externalSubmit(linkToken, request) {
  return http.post(`${BASE}/negotiation/external/${linkToken}/submit`, request);
}
