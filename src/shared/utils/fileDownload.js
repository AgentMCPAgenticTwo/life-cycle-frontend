import { downloadFile } from '@/services/http';

/**
 * Hands a blob to the browser as a file download.
 * @param {Blob} blob
 * @param {string} fileName name used when the response carries no Content-Disposition
 */
export function saveBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

/**
 * Fetches an API-served file with the signed-in user's credentials and saves it.
 *
 * File URLs returned by the API (`fileUrl` / `downloadUrl`) are API routes, not
 * public links — opening them directly leaves the user on a blank page because
 * the SPA router, not the backend, answers the request.
 *
 * @param {string} url absolute URL, or a path relative to the API base URL
 * @param {string} fallbackName file name to use when the response does not supply one
 */
export async function downloadAndSave(url, fallbackName) {
  const { blob, fileName } = await downloadFile(url);
  saveBlob(blob, fileName || fallbackName);
}
