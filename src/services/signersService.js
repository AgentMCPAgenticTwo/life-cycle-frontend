// Typed client for the `/api/v1/contracts/{contractId}/signers` and
// `/api/v1/contracts/{contractId}/audit-certificate` resource groups.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} SignerResponse
 * @property {string} id
 * @property {string} contractId
 * @property {string} signerName
 * @property {string} signerEmail
 * @property {'Internal'|'External'} signerType
 * @property {number} signingOrder
 * @property {'In-built E-signature'|'DocuSign'|'Adobe Sign'|'Aadhaar eSign'} signatureMethod
 * @property {number|null} [reminderFrequencyDays]
 * @property {'Sent'|'Viewed'|'Signed'|'Declined'|'Expired'} signerStatus
 * @property {string|null} [otpVerifiedAt]
 * @property {boolean} signaturePadCompleted
 * @property {string|null} [ipAddress]
 * @property {string|null} [signedAt]
 * @property {string|null} [declineReason]
 * @property {string|null} [linkExpiresAt]
 */

/**
 * @typedef {Object} SignerListResponse
 * @property {string} contractId
 * @property {SignerResponse[]} signers
 * @property {boolean} sendForSignatureEnabled
 * @property {boolean} signingOrderLocked
 */

/**
 * @typedef {Object} AddSignerRequest
 * @property {string} signerName
 * @property {string} signerEmail
 * @property {'Internal'|'External'} signerType
 * @property {number} signingOrder
 * @property {'In-built E-signature'|'DocuSign'|'Adobe Sign'|'Aadhaar eSign'} signatureMethod
 */

/**
 * @typedef {Object} UpdateSignerRequest
 * @property {string} [signerName]
 * @property {string} [signerEmail]
 * @property {'Internal'|'External'} [signerType]
 * @property {number} [signingOrder]
 * @property {'In-built E-signature'|'DocuSign'|'Adobe Sign'|'Aadhaar eSign'} [signatureMethod]
 */

/**
 * @typedef {Object} SendForSignatureRequest
 * @property {'In-built E-signature'|'DocuSign'|'Adobe Sign'|'Aadhaar eSign'} [signatureMethod]
 */

/**
 * @typedef {Object} SendForSignatureResponse
 * @property {string} contractId
 * @property {'Pending Signature'|'SignatureConnectionFailed'} contractStatus
 * @property {SignerResponse[]} signers
 * @property {string|null} [errorMessage]
 */

/**
 * @typedef {Object} AuditCertificateSignerEntry
 * @property {string} signerName
 * @property {string} signerEmail
 * @property {'Internal'|'External'} signerType
 * @property {number} signingOrder
 * @property {string} signatureMethod
 * @property {number|null} [reminderFrequencyDays]
 * @property {string} signerStatus
 * @property {string|null} [ipAddress]
 * @property {string|null} [signedAt]
 * @property {string|null} [otpVerifiedAt]
 * @property {boolean} signaturePadCompleted
 */

/**
 * @typedef {Object} AuditCertificateResponse
 * @property {string} contractId
 * @property {string} generatedAt
 * @property {string} downloadUrl
 * @property {AuditCertificateSignerEntry[]} signers
 */

/** @returns {Promise<SignerListResponse>} */
export function listSigners(contractId) {
  return http.get(`/api/v1/contracts/${contractId}/signers`);
}

/** @returns {Promise<SignerResponse>} */
export function addSigner(contractId, request) {
  return http.post(`/api/v1/contracts/${contractId}/signers`, request);
}

/** @returns {Promise<SignerResponse>} */
export function updateSigner(contractId, signerId, request) {
  return http.put(`/api/v1/contracts/${contractId}/signers/${signerId}`, request);
}

/** @returns {Promise<SignerResponse>} */
export function removeSigner(contractId, signerId) {
  return http.del(`/api/v1/contracts/${contractId}/signers/${signerId}`);
}

/** @returns {Promise<SendForSignatureResponse>} */
export function sendForSignature(contractId, request) {
  return http.post(`/api/v1/contracts/${contractId}/signers/send`, request);
}

/** @returns {Promise<AuditCertificateResponse>} */
export function getAuditCertificate(contractId) {
  return http.get(`/api/v1/contracts/${contractId}/audit-certificate`);
}
