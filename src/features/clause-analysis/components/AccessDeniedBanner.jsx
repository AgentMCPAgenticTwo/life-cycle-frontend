import { Link } from 'react-router-dom';

// Permission-denied message shown to unauthorized roles attempting to view
// the Clause Analysis screen (UC4-AF-003 / UC4-BR-012).
export default function AccessDeniedBanner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
        <h1 className="text-lg font-semibold text-red-300">Access denied</h1>
        <p className="mt-2 text-sm text-red-200">
          You do not have permission to view this contract&apos;s clause analysis.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
