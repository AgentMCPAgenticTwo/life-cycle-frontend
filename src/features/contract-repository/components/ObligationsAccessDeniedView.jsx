import { Link } from 'react-router-dom';

/**
 * Shown in place of the Obligations & Renewal screen for a role that is not
 * Contract Owner, Tenant Admin, or an authorized Legal Reviewer — this blocks
 * Approver, External Party and Signer per UC9-AF-003 / UC9-BR-012. No
 * obligation, renewal or termination data is rendered alongside it.
 */
export default function ObligationsAccessDeniedView() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div role="alert" className="max-w-md rounded-xl border border-neutral-800 bg-neutral-900/60 px-8 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-600/40 bg-red-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6 text-red-400"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h1 className="mt-4 text-base font-semibold text-neutral-100">Access Denied</h1>
        <p className="mt-2 text-sm text-neutral-400">You do not have permission to view this page</p>
        <Link
          to="/contract-repository"
          className="mt-6 inline-block rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-emerald-500 hover:text-emerald-400"
        >
          Back to Contract Repository
        </Link>
      </div>
    </div>
  );
}
