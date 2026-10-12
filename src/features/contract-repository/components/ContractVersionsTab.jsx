import { useContractVersions } from '@/features/contract-repository/hooks/useContractVersions';
import { formatDate } from '@/features/contract-repository/utils/format';

/**
 * Version history list (Versions tab). `ContractVersionResponse` has no
 * dedicated file-name field, so the "File" column shows `changeSummary` —
 * the closest available field to the design's per-version file name (see
 * task blockers).
 */
export default function ContractVersionsTab({ contractId }) {
  const { data, isLoading, error } = useContractVersions(contractId);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">Versions</h2>
      <p className="mt-0.5 text-xs text-neutral-500">Prior uploads of this document</p>

      {isLoading && <p className="mt-4 text-sm text-neutral-500">Loading versions…</p>}
      {error && <p className="mt-4 text-sm text-red-400">Unable to load version history.</p>}

      {!isLoading && !error && data.length === 0 && (
        <p className="mt-4 text-sm text-neutral-500">No versions recorded for this contract.</p>
      )}

      {!isLoading && !error && data.length > 0 && (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-neutral-500">
              <th className="pb-2 font-medium">Version</th>
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Uploaded by</th>
              <th className="pb-2 font-medium">File</th>
            </tr>
          </thead>
          <tbody>
            {data
              .slice()
              .sort((a, b) => b.versionNumber - a.versionNumber)
              .map((version) => (
                <tr key={version.versionId} className="border-t border-neutral-800/70">
                  <td className="py-2.5 font-medium text-emerald-400">v{version.versionNumber}</td>
                  <td className="py-2.5 text-neutral-300">{formatDate(version.createdAt)}</td>
                  <td className="py-2.5 text-neutral-300">{version.createdBy}</td>
                  <td className="py-2.5 text-neutral-400">{version.changeSummary ?? '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
