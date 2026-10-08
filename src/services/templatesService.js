// Typed client for the `/api/v1/templates` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} TemplateResponse
 * @property {string} id
 * @property {string} templateName
 * @property {string} templateCategory
 * @property {string} documentFormat
 * @property {string} templateBody
 * @property {string} status
 * @property {string} lastModifiedBy
 * @property {string} lastModifiedDate
 */

/**
 * @typedef {Object} TemplateListResponse
 * @property {TemplateResponse[]} items
 */

/**
 * @typedef {Object} CreateTemplateRequest
 * @property {string} templateName
 * @property {string} templateCategory
 * @property {string} documentFormat
 * @property {string} templateBody
 */

/**
 * @typedef {Object} UpdateTemplateRequest
 * @property {string} templateName
 * @property {string} templateCategory
 * @property {string} documentFormat
 * @property {string} templateBody
 */

/**
 * @typedef {Object} VersionHistoryItemResponse
 * @property {number} versionNumber
 * @property {string} changedBy
 * @property {string} dateChanged
 * @property {string} [changeSummary]
 */

/**
 * @typedef {Object} VersionHistoryResponse
 * @property {VersionHistoryItemResponse[]} items
 */

function buildTemplatesQuery(filters = {}) {
  const params = new URLSearchParams();
  const { contractType, industry, status } = filters;

  if (contractType) params.set('contractType', contractType);
  if (industry) params.set('industry', industry);
  if (status) params.set('status', status);

  return params.toString();
}

/** @returns {Promise<TemplateListResponse>} */
export function listTemplates(filters = {}) {
  const query = buildTemplatesQuery(filters);
  return http.get(`/api/v1/templates${query ? `?${query}` : ''}`);
}

/** @returns {Promise<TemplateResponse>} */
export function createTemplate(request) {
  return http.post('/api/v1/templates', request);
}

/** @returns {Promise<TemplateResponse>} */
export function updateTemplate(id, request) {
  return http.put(`/api/v1/templates/${id}`, request);
}

/** @returns {Promise<TemplateResponse>} */
export function deactivateTemplate(id) {
  return http.post(`/api/v1/templates/${id}/deactivate`);
}

/** @returns {Promise<TemplateResponse>} */
export function reactivateTemplate(id) {
  return http.post(`/api/v1/templates/${id}/reactivate`);
}

/** @returns {Promise<VersionHistoryResponse>} */
export function getTemplateVersions(id) {
  return http.get(`/api/v1/templates/${id}/versions`);
}
