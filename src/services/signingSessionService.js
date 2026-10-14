// Typed client for the `/api/v1/signing-sessions/{sessionId}` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} SigningSessionResponse
 * @property {string} sessionId
 * @property {string} contractId
 * @property {string} signerId
 * @property {string} signerName
 * @property {string} signerEmail
 * @property {'Sent'|'Viewed'|'Signed'|'Declined'|'Expired'} signerStatus
 * @property {boolean} isCurrentTurn
 * @property {boolean} otpVerified
 * @property {string|null} [documentUrl]
 * @property {boolean} signaturePadAvailable
 * @property {boolean} declineAvailable
 * @property {number|null} [reminderFrequencyDays]
 * @property {boolean} linkExpired
 * @property {string|null} [blockedMessage]
 */

/**
 * @typedef {Object} VerifyOtpRequest
 * @property {string} otpCode
 */

/**
 * @typedef {Object} VerifyOtpResponse
 * @property {'Sent'|'Viewed'|'Signed'|'Declined'|'Expired'} signerStatus
 * @property {string|null} [documentUrl]
 * @property {boolean} signaturePadAvailable
 * @property {number|null} [attemptsRemaining]
 * @property {string|null} [lockedUntil]
 * @property {string|null} [errorMessage]
 */

/**
 * @typedef {Object} ApplySignatureRequest
 * @property {string} signatureData
 * @property {'Draw'|'Type'|'Upload'} signatureType
 */

/**
 * @typedef {Object} ApplySignatureResponse
 * @property {string} signerId
 * @property {'Signed'} signerStatus
 * @property {'Pending Signature'|'Executed'} contractStatus
 * @property {string|null} [nextSignerId]
 */

/**
 * @typedef {Object} DeclineSignatureRequest
 * @property {string} reason
 */

/**
 * @typedef {Object} DeclineSignatureResponse
 * @property {string} signerId
 * @property {'Declined'} signerStatus
 * @property {'Signature Declined'} contractStatus
 * @property {string} reason
 */

/** @returns {Promise<SigningSessionResponse>} */
export function getSigningSession(sessionId) {
  return http.get(`/api/v1/signing-sessions/${sessionId}`);
}

/** @returns {Promise<VerifyOtpResponse>} */
export function verifyOtp(sessionId, request) {
  return http.post(`/api/v1/signing-sessions/${sessionId}/otp/verify`, request);
}

/** @returns {Promise<SigningSessionResponse>} */
export function resendOtp(sessionId) {
  return http.post(`/api/v1/signing-sessions/${sessionId}/otp/resend`);
}

/** @returns {Promise<ApplySignatureResponse>} */
export function applySignature(sessionId, request) {
  return http.post(`/api/v1/signing-sessions/${sessionId}/sign`, request);
}

/** @returns {Promise<DeclineSignatureResponse>} */
export function declineSignature(sessionId, request) {
  return http.post(`/api/v1/signing-sessions/${sessionId}/decline`, request);
}
