// Typed client for the `/api/v1/esignature-settings` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} EsignatureSettingsResponse
 * @property {number} reminderFrequencyDays
 * @property {'In-built E-signature'|'DocuSign'|'Adobe Sign'|'Aadhaar eSign'} defaultSignatureProvider
 */

/**
 * @typedef {Object} UpdateEsignatureSettingsRequest
 * @property {number} [reminderFrequencyDays]
 * @property {string} [defaultSignatureProvider]
 */

/** @returns {Promise<EsignatureSettingsResponse>} */
export function getEsignatureSettings() {
  return http.get('/api/v1/esignature-settings');
}

/** @returns {Promise<EsignatureSettingsResponse>} */
export function updateEsignatureSettings(request) {
  return http.put('/api/v1/esignature-settings', request);
}
