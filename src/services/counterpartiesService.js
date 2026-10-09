// Typed client for the `/api/v1/counterparties` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} CounterpartyResponse
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} company
 * @property {string|null} [address]
 * @property {string|null} [gstTaxId]
 */

/**
 * @typedef {Object} CounterpartySearchResponse
 * @property {CounterpartyResponse[]} items
 * @property {string|null} [duplicateWarning]
 */

/**
 * @typedef {Object} CreateCounterpartyRequest
 * @property {string} name
 * @property {string} email
 * @property {string} company
 * @property {string} [address]
 * @property {string} [gstTaxId]
 */

/**
 * Searches existing counterparties by name, company or GST/Tax ID.
 * The endpoint's request DTO is undocumented ("—"); `search` is inferred from
 * this repo's other list endpoints (see contractsService.listContracts), and
 * is also used here to detect a GST/Tax ID duplicate match (UC2-AF-008).
 * @returns {Promise<CounterpartySearchResponse>}
 */
export function searchCounterparties(search) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  return http.get(`/api/v1/counterparties${params.toString() ? `?${params}` : ''}`);
}

/** @returns {Promise<CounterpartyResponse>} */
export function createCounterparty(request) {
  return http.post('/api/v1/counterparties', request);
}
