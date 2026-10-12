// Typed client for the `/api/v1/lifecycle` Clause Analysis (UC4) resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

const BASE = '/api/v1/lifecycle';

/**
 * @typedef {Object} ClauseResponse
 * @property {string} clauseId
 * @property {string} clauseText
 * @property {string} [clauseCategory]
 * @property {string} libraryMatchStatus
 * @property {string} riskScore
 * @property {string} [aiExplanation]
 * @property {string} [suggestedText]
 * @property {string} status
 * @property {boolean} isMandatory
 * @property {boolean} mandatoryClauseFlag
 * @property {string} [mandatoryClauseFlagLabel]
 * @property {number} version
 * @property {string} updatedAt
 * @property {string} [updatedBy]
 */

/**
 * @typedef {Object} ContractMetadataResponse
 * @property {string} [parties]
 * @property {string} partiesLabel
 * @property {number} [contractValue]
 * @property {string} contractValueLabel
 * @property {string} [startDate]
 * @property {string} startDateLabel
 * @property {string} [endDate]
 * @property {string} endDateLabel
 * @property {string} [renewalTerms]
 * @property {string} renewalTermsLabel
 * @property {string} [paymentTerms]
 * @property {string} paymentTermsLabel
 * @property {string} [keyObligations]
 * @property {string} keyObligationsLabel
 */

/**
 * @typedef {Object} ClauseAnalysisResponse
 * @property {string} contractId
 * @property {boolean} fileFormatSupported
 * @property {string} analysisStatus
 * @property {ClauseResponse[]} clauses
 * @property {string} overallContractRiskScore
 * @property {ContractMetadataResponse} [metadata]
 * @property {boolean} proceedToNegotiationEnabled
 * @property {boolean} askAiEnabled
 */

/** @returns {Promise<ClauseAnalysisResponse>} */
export function getClauseAnalysis(contractId) {
  return http.get(`${BASE}/contracts/${contractId}/clause-analysis`);
}

/** @returns {Promise<ClauseResponse>} */
export function acceptSuggestion(contractId, clauseId) {
  return http.post(`${BASE}/contracts/${contractId}/clauses/${clauseId}/accept-suggestion`);
}

/**
 * @typedef {Object} EditClauseRequest
 * @property {string} clauseText
 * @property {number} expectedVersion
 */

/** @returns {Promise<ClauseResponse>} */
export function editClause(contractId, clauseId, request) {
  return http.put(`${BASE}/contracts/${contractId}/clauses/${clauseId}`, request);
}

/**
 * @typedef {Object} RejectClauseRequest
 * @property {string} [reason]
 */

/** @returns {Promise<ClauseResponse>} */
export function rejectClause(contractId, clauseId, request) {
  return http.post(`${BASE}/contracts/${contractId}/clauses/${clauseId}/reject`, request);
}

/**
 * @typedef {Object} UpdateMetadataRequest
 * @property {string} [parties]
 * @property {number} [contractValue]
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} [renewalTerms]
 * @property {string} [paymentTerms]
 * @property {string} [keyObligations]
 */

/** @returns {Promise<ContractMetadataResponse>} */
export function updateMetadata(contractId, request) {
  return http.put(`${BASE}/contracts/${contractId}/metadata`, request);
}

/**
 * @typedef {Object} AskAIRequest
 * @property {string} question
 */

/**
 * @typedef {Object} AskAIResponse
 * @property {string} answer
 * @property {string} disclaimer
 * @property {string[]} [relatedClauseIds]
 */

/** @returns {Promise<AskAIResponse>} */
export function askAI(contractId, request) {
  return http.post(`${BASE}/contracts/${contractId}/ask-ai`, request);
}

/**
 * @typedef {Object} ProceedToNegotiationResponse
 * @property {string} contractId
 * @property {string} negotiationStatus
 * @property {string} [routedAt]
 * @property {ClauseResponse[]} clauses
 * @property {string} overallContractRiskScore
 * @property {ContractMetadataResponse} [metadata]
 * @property {boolean} askAiAvailable
 */

/** @returns {Promise<ProceedToNegotiationResponse>} */
export function proceedToNegotiation(contractId) {
  return http.post(`${BASE}/contracts/${contractId}/proceed-to-negotiation`);
}

/** @returns {Promise<ClauseAnalysisResponse>} */
export function retryExtraction(contractId) {
  return http.post(`${BASE}/contracts/${contractId}/retry-extraction`);
}

/**
 * @typedef {Object} AuditLogEntryResponse
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {string} timestamp
 * @property {string} [clauseId]
 * @property {string} actionType
 * @property {string} [fieldName]
 * @property {string} [beforeText]
 * @property {string} [afterText]
 */

/**
 * @typedef {Object} PagedAuditLogResponse
 * @property {AuditLogEntryResponse[]} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalCount
 */

/** @returns {Promise<PagedAuditLogResponse>} */
export function getAuditLog(contractId, { page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return http.get(`${BASE}/contracts/${contractId}/audit-log?${params.toString()}`);
}
