// Typed client for the `/api/v1/tracker` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} TrackerQueryParams
 * @property {string} [period]
 * @property {string} [contractTypeFilter]
 * @property {string} [ownerFilter]
 * @property {string} [dateRangeFrom]
 * @property {string} [dateRangeTo]
 * @property {number} [page]
 * @property {number} [pageSize]
 */

function buildTrackerQuery(params = {}) {
  const search = new URLSearchParams();
  const { period, contractTypeFilter, ownerFilter, dateRangeFrom, dateRangeTo, page, pageSize } = params;

  if (period) search.set('period', period);
  if (contractTypeFilter) search.set('contractTypeFilter', contractTypeFilter);
  if (ownerFilter) search.set('ownerFilter', ownerFilter);
  if (dateRangeFrom) search.set('dateRangeFrom', dateRangeFrom);
  if (dateRangeTo) search.set('dateRangeTo', dateRangeTo);
  if (page) search.set('page', String(page));
  if (pageSize) search.set('pageSize', String(pageSize));

  return search.toString();
}

/** @returns {Promise<import('./trackerService').OwnershipTabResponse>} */
export function getOwnershipTab(params = {}) {
  const query = buildTrackerQuery(params);
  return http.get(`/api/v1/tracker/ownership${query ? `?${query}` : ''}`);
}

/** @returns {Promise<import('./trackerService').CycleTimeTabResponse>} */
export function getCycleTimeTab(params = {}) {
  const query = buildTrackerQuery(params);
  return http.get(`/api/v1/tracker/cycle-time${query ? `?${query}` : ''}`);
}

/** @returns {Promise<import('./trackerService').BottleneckTabResponse>} */
export function getBottleneckTab(params = {}) {
  const query = buildTrackerQuery(params);
  return http.get(`/api/v1/tracker/bottleneck${query ? `?${query}` : ''}`);
}

/** @returns {Promise<import('./trackerService').TurnaroundTabResponse>} */
export function getTurnaroundTab(params = {}) {
  const query = buildTrackerQuery(params);
  return http.get(`/api/v1/tracker/turnaround${query ? `?${query}` : ''}`);
}

/**
 * @param {Object} request TrackerExportRequest
 * @returns {Promise<{success: boolean, fileUrl?: string|null, failureMessage?: string|null}>}
 */
export function exportTrackerTab(request) {
  return http.post('/api/v1/tracker/export', request);
}

/**
 * @param {string} contractId
 * @param {Object} request EstimatedTurnaroundOverrideRequest
 * @returns {Promise<import('./trackerService').TurnaroundRowResponse>}
 */
export function overrideEstimatedTurnaround(contractId, request) {
  return http.put(`/api/v1/tracker/turnaround/${contractId}/estimated-override`, request);
}

/** @returns {Promise<{stage: string, thresholdDays: number}[]>} */
export function getBottleneckThresholds() {
  return http.get('/api/v1/tracker/bottleneck-thresholds');
}
