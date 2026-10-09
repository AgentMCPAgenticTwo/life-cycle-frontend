// Typed client for the `/api/v1/contracts` resource group.
// See CLAUDE.md: one service module per resource group, calling exactly the
// paths/DTOs declared in the module contract.

import { http } from '@/services/http';

/**
 * @typedef {Object} ContractListItemResponse
 * @property {string} id
 * @property {string} contractName
 * @property {string} contractType
 * @property {string|null} [department]
 * @property {string} counterpartyName
 * @property {string} contractOwnerName
 * @property {string} status
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} contractValue
 * @property {string} currency
 * @property {number|null} [riskScore]
 */

/**
 * @typedef {Object} ContractListResponse
 * @property {ContractListItemResponse[]} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalCount
 * @property {string|null} [noMatchMessage]
 */

/**
 * @typedef {Object} ContractResponse
 * @property {string} id
 * @property {string} contractName
 * @property {string} status
 */

/**
 * Builds the query string for GET /api/v1/contracts from the page's filter state.
 * Only includes params that are actually set, so untouched filters are never sent.
 * @param {object} filters
 */
function buildContractsQuery(filters = {}) {
  const params = new URLSearchParams();
  const {
    status,
    contractType,
    department,
    counterpartyId,
    ownerId,
    dateRangeStart,
    dateRangeEnd,
    search,
    sortBy,
    sortOrder,
    page,
    pageSize,
  } = filters;

  if (status) params.set('status', status);
  if (contractType) params.set('contractType', contractType);
  if (department) params.set('department', department);
  if (counterpartyId) params.set('counterpartyId', counterpartyId);
  if (ownerId) params.set('ownerId', ownerId);
  if (dateRangeStart) params.set('dateRangeStart', dateRangeStart);
  if (dateRangeEnd) params.set('dateRangeEnd', dateRangeEnd);
  if (search) params.set('search', search);
  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);
  params.set('page', String(page ?? 1));
  params.set('pageSize', String(pageSize ?? 20));

  return params.toString();
}

/** @returns {Promise<ContractListResponse>} */
export function listContracts(filters = {}) {
  const query = buildContractsQuery(filters);
  return http.get(`/api/v1/contracts?${query}`);
}

/** @returns {Promise<ContractResponse>} */
export function getContract(id) {
  return http.get(`/api/v1/contracts/${id}`);
}

/**
 * @typedef {Object} UploadThirdPartyPaperRequest
 * @property {string} fileName
 * @property {string} fileContentBase64
 * @property {number} fileSize
 * @property {string} fileFormat
 */

/**
 * @typedef {Object} FileUploadResponse
 * @property {string} fileId
 * @property {string} fileName
 * @property {number} fileSize
 * @property {string} fileFormat
 * @property {string} storageUrl
 */

/**
 * Uploads a third party paper file (PDF/DOCX, max 25MB) as an alternative to
 * Template selection (UC2-AF-005 / UC2-AF-006 / UC2-BR-008).
 * @returns {Promise<FileUploadResponse>}
 */
export function uploadThirdPartyPaper(request) {
  return http.post('/api/v1/contracts/third-party-paper', request);
}

/**
 * @typedef {Object} CreateContractRequest
 * @property {string} contractType
 * @property {string} industry
 * @property {string} [templateId]
 * @property {string} [thirdPartyPaperFileId]
 * @property {string} [counterpartySearch]
 * @property {string} [counterpartyId]
 * @property {string} [counterpartyName]
 * @property {string} [counterpartyEmail]
 * @property {string} [counterpartyCompany]
 * @property {string} [counterpartyAddress]
 * @property {string} [counterpartyGstTaxId]
 * @property {string} contractOwnerId
 * @property {number} contractValue
 * @property {string} currency
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} renewalType
 * @property {number} [noticePeriod]
 * @property {string} dueDate
 */

/**
 * Creates a new contract from a Template or uploaded third party paper and
 * saves it as Draft (UC2-MF-001).
 * @returns {Promise<ContractResponse>}
 */
export function createContract(request) {
  return http.post('/api/v1/contracts', request);
}
