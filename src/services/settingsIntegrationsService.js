// Typed client for the `/api/v1/settings/integrations` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} IntegrationResponse
 * @property {string} integrationName
 * @property {string} connectionStatus
 * @property {string|null} [maskedCredential]
 */

/**
 * @typedef {Object} ConnectIntegrationRequest
 * @property {Object} credentials
 */

/** @returns {Promise<IntegrationResponse[]>} */
export function listIntegrations() {
  return http.get('/api/v1/settings/integrations');
}

/**
 * @param {string} integrationName
 * @param {ConnectIntegrationRequest} request
 * @returns {Promise<IntegrationResponse>}
 */
export function connectIntegration(integrationName, request) {
  return http.post(`/api/v1/settings/integrations/${encodeURIComponent(integrationName)}/connect`, request);
}

/**
 * @param {string} integrationName
 * @returns {Promise<IntegrationResponse>}
 */
export function disconnectIntegration(integrationName) {
  return http.post(`/api/v1/settings/integrations/${encodeURIComponent(integrationName)}/disconnect`);
}
