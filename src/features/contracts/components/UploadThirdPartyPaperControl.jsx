import { useRef, useState } from 'react';
import { useUploadThirdPartyPaper } from '@/features/contracts/hooks/useUploadThirdPartyPaper';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const EXTENSION_TO_FORMAT = { pdf: 'PDF', docx: 'DOCX' };

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a PDF/DOCX third party paper file up to 25MB, mutually exclusive
 * with Template selection (UC2-BR-008). Rejects unsupported formats
 * (UC2-AF-005) and oversized files (UC2-AF-006) before calling the API.
 */
export default function UploadThirdPartyPaperControl({ disabled, uploadedFile, onUploadSuccess, onRemove }) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState(null);
  const { mutate, isLoading } = useUploadThirdPartyPaper();

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const fileFormat = EXTENSION_TO_FORMAT[extension];

    if (!fileFormat) {
      setLocalError('Unsupported file format. Please upload PDF or DOCX only.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setLocalError('File size exceeds the 25 MB limit. Please upload a smaller file.');
      return;
    }

    setLocalError(null);
    try {
      const fileContentBase64 = await readFileAsBase64(file);
      const response = await mutate({
        fileName: file.name,
        fileContentBase64,
        fileSize: file.size,
        fileFormat,
      });
      onUploadSuccess(response);
    } catch (err) {
      setLocalError(err.message || 'Upload failed. Please try again.');
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {!uploadedFile ? (
        <>
          <button
            type="button"
            disabled={disabled || isLoading}
            onClick={() => inputRef.current?.click()}
            className="w-fit rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Uploading…' : 'Upload Third Party Paper'}
          </button>
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
        </>
      ) : (
        <div className="flex w-fit items-center gap-3 rounded-md border border-neutral-700 px-4 py-2 text-sm">
          <span className="text-neutral-200">{uploadedFile.fileName}</span>
          <button type="button" onClick={onRemove} className="text-neutral-500 hover:text-neutral-200" aria-label="Remove uploaded file">
            ×
          </button>
        </div>
      )}
      <span className="text-[11px] text-neutral-500">
        Accepts PDF/DOCX, up to 25MB. Mutually exclusive with Template selection.
      </span>
      {localError && <p className="text-xs text-red-400">{localError}</p>}
    </div>
  );
}
