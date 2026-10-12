// Blocking message displayed when the contract file format is unsupported for
// AI analysis (UC4-AF-001). No clause, metadata or Ask AI content is rendered
// alongside it.
export default function UnsupportedFileBlocker() {
  return (
    <div role="alert" className="rounded-xl border border-amber-700/40 bg-amber-500/10 px-6 py-8 text-center">
      <h2 className="text-base font-semibold text-amber-300">Unsupported file format</h2>
      <p className="mt-2 text-sm text-amber-200">
        This file type is not supported for AI analysis. Please upload a PDF or DOCX file.
      </p>
    </div>
  );
}
