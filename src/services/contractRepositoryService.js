// Typed client for the life-cycle-uc8-uc9 "ContractRepositoryModule" contract.
// Same `/api/v1/contracts` base path as uc123's contractsService.js, but this
// module's response shapes (ContractListItemResponse / ContractDetailResponse
// / ...) are a different, later contract revision — see CLAUDE.md's module
// section for `life-cycle-uc8-uc9`. Kept as its own service module so neither
// module's DTOs or call sites have to change.

import { http } from '@/services/http';

/**
 * @typedef {Object} FolderTagOptionResponse
 * @property {string} id
 * @property {string} name
 * @property {'Folder'|'Tag'} kind
 */

/**
 * @typedef {Object} ContractListItemResponse
 * @property {string} contractId
 * @property {string} contractName
 * @property {string} counterparty
 * @property {string} status
 * @property {number} [value]
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} owner
 * @property {string} lastModified
 * @property {FolderTagOptionResponse[]} [folderTags]
 * @property {boolean} indexingInProgress
 */

/**
 * @typedef {Object} ContractDetailResponse
 * @property {string} id
 * @property {string} contractName
 * @property {string} contractType
 * @property {string} counterpartyName
 * @property {string} status
 * @property {number} [contractValue]
 * @property {string} [currency]
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} contractOwnerName
 * @property {string} lastModified
 * @property {FolderTagOptionResponse[]} [folderTags]
 * @property {string[]} availableTabs
 */

/**
 * @typedef {Object} ContractDocumentResponse
 * @property {string} contractId
 * @property {string} [documentUrl]
 * @property {string} fileName
 * @property {'PDF'|'DOCX'} fileType
 * @property {number} fileSizeBytes
 * @property {boolean} isOversized
 * @property {boolean} isCorruptedOrMissing
 * @property {boolean} downloadEnabled
 * @property {string} [unavailableComment]
 */

/**
 * @typedef {Object} DocumentDownloadResponse
 * @property {boolean} success
 * @property {string} [fileUrl]
 * @property {string} [errorMessage]
 */

/**
 * @typedef {Object} ContractVersionResponse
 * @property {string} versionId
 * @property {number} versionNumber
 * @property {string} createdAt
 * @property {string} createdBy
 * @property {string} [changeSummary]
 */

/**
 * @typedef {Object} ActivityLogEntryResponse
 * @property {string} entryId
 * @property {string} contractId
 * @property {'Create'|'Edit'|'Approve'|'Reject'|'Sign'|'Tag'} actionType
 * @property {string} performedBy
 * @property {string} performedAt
 * @property {string} [details]
 */

/**
 * @typedef {Object} ObligationResponse
 * @property {string} obligationId
 * @property {string} contractId
 * @property {string} obligationDescription
 * @property {'Deliverable'|'Payment Milestone'|'SLA'|'Reporting'} obligationType
 * @property {string} [owner]
 * @property {string} [dueDate]
 * @property {'Pending'|'In Progress'|'Completed'|'Overdue'} status
 * @property {'AI Extracted'|'Manually Added'} source
 * @property {'AI Suggested'|'Confirmed'} confirmationLabel
 * @property {string} [evidenceReference]
 * @property {boolean} readOnly
 */

/**
 * @typedef {Object} CreateObligationRequest
 * @property {string} obligationDescription
 * @property {'Deliverable'|'Payment Milestone'|'SLA'|'Reporting'} obligationType
 * @property {string} owner
 * @property {string} dueDate
 * @property {'Pending'|'In Progress'|'Completed'|'Overdue'} status
 */

/**
 * @typedef {Object} UpdateObligationRequest
 * @property {string} [obligationDescription]
 * @property {'Deliverable'|'Payment Milestone'|'SLA'|'Reporting'} [obligationType]
 * @property {string} [owner]
 * @property {string} [dueDate]
 * @property {'Pending'|'In Progress'|'Completed'|'Overdue'} [status]
 * @property {string} [evidenceReference]
 */

/**
 * @typedef {Object} RenewalPanelResponse
 * @property {string} contractId
 * @property {string} [renewalAlertBanner]
 * @property {string} [contractEndDate]
 * @property {string} [noticePeriod]
 * @property {number} [alertThresholdDays]
 * @property {boolean} renewEnabled
 * @property {boolean} amendEnabled
 * @property {boolean} terminateEnabled
 * @property {boolean} actionInProgress
 * @property {string} [linkedContractId]
 * @property {'Renewal'|'Amendment'|'Termination'} [linkedContractRelation]
 * @property {ObligationResponse[]} [obligations]
 * @property {string} [terminationReason]
 * @property {string} [effectiveTerminationDate]
 */

/**
 * @typedef {Object} TerminateContractRequest
 * @property {string} terminationReason
 * @property {string} effectiveTerminationDate
 */

/**
 * @typedef {Object} LinkedContractActionResponse
 * @property {string} originalContractId
 * @property {'Renewed'|'Amended'|'Terminated'} originalContractStatus
 * @property {string} linkedContractId
 * @property {string} linkedContractReference
 * @property {string} [terminationReason]
 * @property {string} [effectiveTerminationDate]
 * @property {string} [contractEndDate]
 * @property {string} [noticePeriod]
 * @property {string} [renewalAlertBanner]
 * @property {ObligationResponse[]} [obligations]
 */

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * Searches, filters, sorts and paginates contracts visible to the current user (UC8-MF-001).
 * @returns {Promise<{items: ContractListItemResponse[], totalCount: number}>}
 */
export function searchContracts(filters = {}) {
  return http.get(`/api/v1/contracts${buildQuery(filters)}`);
}

/** @returns {Promise<ContractDetailResponse>} */
export function getContractDetail(contractId) {
  return http.get(`/api/v1/contracts/${contractId}`);
}

/** @returns {Promise<ContractDocumentResponse>} */
export function getContractDocument(contractId) {
  return http.get(`/api/v1/contracts/${contractId}/document`);
}

/**
 * Downloads the current document file; the response reports failure (instead of
 * throwing) for corrupted/missing/oversized files (UC8-AF-005, UC8-BR-006).
 * @returns {Promise<DocumentDownloadResponse>}
 */
export function getDocumentDownload(contractId) {
  return http.get(`/api/v1/contracts/${contractId}/document/download`);
}

/** @returns {Promise<{items: ContractVersionResponse[], totalCount: number}>} */
export function getContractVersions(contractId) {
  return http.get(`/api/v1/contracts/${contractId}/versions`);
}

/** @returns {Promise<{items: ActivityLogEntryResponse[], totalCount: number}>} */
export function getContractActivityLog(contractId) {
  return http.get(`/api/v1/contracts/${contractId}/activity-log`);
}

/**
 * @param {string} contractId
 * @param {{folderTagIds: string[]}} request
 * @returns {Promise<{contractId: string, folderTags: FolderTagOptionResponse[]}>}
 */
export function assignFolderTags(contractId, request) {
  return http.post(`/api/v1/contracts/${contractId}/folder-tags`, request);
}

/** @returns {Promise<FolderTagOptionResponse[]>} */
export function listFolderTagOptions() {
  return http.get('/api/v1/folder-tags');
}

/** Lists obligations for an Executed contract (UC9-GC-001). @returns {Promise<{items: ObligationResponse[], totalCount: number}>} */
export function getObligations(contractId) {
  return http.get(`/api/v1/contracts/${contractId}/obligations`);
}

/**
 * Manually adds an obligation when none were AI-extracted (UC9-AF-001).
 * @param {string} contractId
 * @param {CreateObligationRequest} request
 * @returns {Promise<ObligationResponse>}
 */
export function createObligation(contractId, request) {
  return http.post(`/api/v1/contracts/${contractId}/obligations`, request);
}

/**
 * Edits obligation fields, transitioning Source label to Confirmed (UC9-BR-005).
 * @param {string} contractId
 * @param {string} obligationId
 * @param {UpdateObligationRequest} request
 * @returns {Promise<ObligationResponse>}
 */
export function updateObligation(contractId, obligationId, request) {
  return http.patch(`/api/v1/contracts/${contractId}/obligations/${obligationId}`, request);
}

/** Accepts an AI-suggested obligation (UC9-BR-005). @returns {Promise<ObligationResponse>} */
export function acceptObligation(contractId, obligationId) {
  return http.post(`/api/v1/contracts/${contractId}/obligations/${obligationId}/accept`);
}

/** @returns {Promise<RenewalPanelResponse>} */
export function getRenewalPanel(contractId) {
  return http.get(`/api/v1/contracts/${contractId}/renewal`);
}

/** Creates a linked renewal contract (UC9-BR-016). @returns {Promise<LinkedContractActionResponse>} */
export function renewContract(contractId) {
  return http.post(`/api/v1/contracts/${contractId}/renew`);
}

/** Creates a linked amendment contract (UC9-BR-017). @returns {Promise<LinkedContractActionResponse>} */
export function amendContract(contractId) {
  return http.post(`/api/v1/contracts/${contractId}/amend`);
}

/**
 * Terminates the contract with a required reason and effective date (UC9-BR-018).
 * @param {string} contractId
 * @param {TerminateContractRequest} request
 * @returns {Promise<LinkedContractActionResponse>}
 */
export function terminateContract(contractId, request) {
  return http.post(`/api/v1/contracts/${contractId}/terminate`, request);
}
