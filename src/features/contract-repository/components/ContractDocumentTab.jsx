import { useContractDocument } from '@/features/contract-repository/hooks/useContractDocument';
import { useDocumentDownload } from '@/features/contract-repository/hooks/useDocumentDownload';
import DownloadButton from '@/features/contract-repository/components/DownloadButton';

/**
 * PDF/DOCX viewer for the Document tab (UC8-BR-006, UC8-AF-005). Oversized
 * documents render a disabled DownloadButton with the "File unavailable"
 * comment; corrupted/missing documents keep the button enabled but surface
 * the retrieval error returned by the `/document/download` endpoint on click.
 */
export default function ContractDocumentTab({ contractId }) {
  const { data, isLoading, error } = useContractDocument(contractId);
  const { download, error: downloadError, isDownloading } = useDocumentDownload(contractId);

  if (isLoading) {
    return (
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 text-sm text-neutral-500">
        Loading document…
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 text-sm text-red-400">
        Unable to load the document for this contract.
      </section>
    );
  }

  if (!data) return null;

  // Oversized documents stay disabled with the "File unavailable" comment
  // (UC8-BR-006); corrupted/missing documents keep Download enabled and surface
  // the retrieval error on click instead (UC8-AF-005).
  const unavailable = data.isCorruptedOrMissing || data.isOversized;
  const downloadEnabled = data.downloadEnabled && !data.isOversized;

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">Document</h2>
      <p className="mt-0.5 text-xs text-neutral-500">Current executed file</p>

      <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-950/60 px-4 text-center text-xs text-neutral-500">
        {unavailable
          ? data.unavailableComment || 'File unavailable'
          : `${data.fileType} viewer — ${data.fileName}`}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <DownloadButton
          enabled={downloadEnabled}
          comment={data.unavailableComment || 'File unavailable'}
          onClick={download}
          isLoading={isDownloading}
        />
      </div>
      {downloadError ? <p className="mt-2 text-xs text-red-400">{downloadError}</p> : null}
    </section>
  );
}
