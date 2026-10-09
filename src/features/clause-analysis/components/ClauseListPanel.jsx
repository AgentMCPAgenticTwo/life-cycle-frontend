import { useState } from 'react';
import MandatoryClauseFlagBadge from '@/features/clause-analysis/components/MandatoryClauseFlagBadge';

const MATCH_STATUS_STYLES = {
  Standard: 'bg-emerald-500/15 text-emerald-400',
  Deviated: 'bg-amber-500/15 text-amber-400',
  Missing: 'bg-red-500/15 text-red-400',
  'Non-standard': 'bg-neutral-700/60 text-neutral-300',
};

const RISK_TEXT_STYLES = {
  Low: 'text-emerald-400',
  Medium: 'text-amber-400',
  High: 'text-red-400',
};

const STATUS_DOT_STYLES = {
  Standard: 'bg-emerald-500 text-emerald-950',
  Deviated: 'bg-amber-500 text-amber-950',
  Missing: 'bg-red-500 text-red-950',
  'Non-standard': 'bg-neutral-500 text-neutral-950',
};

function isFlagged(clause) {
  return clause.libraryMatchStatus !== 'Standard' || clause.mandatoryClauseFlag;
}

// Grid listing each extracted clause with Clause Category and Library Match
// Status columns (UC4-GC-001). Rows are clickable to open the
// ClauseDetailDrawer for that clause.
export default function ClauseListPanel({ clauses, selectedClauseId, onSelect }) {
  const [tab, setTab] = useState('all');

  const stats = {
    total: clauses.length,
    standard: clauses.filter((c) => c.libraryMatchStatus === 'Standard').length,
    deviated: clauses.filter((c) => c.libraryMatchStatus === 'Deviated').length,
    missing: clauses.filter((c) => c.libraryMatchStatus === 'Missing').length,
    nonStandard: clauses.filter((c) => c.libraryMatchStatus === 'Non-standard').length,
  };

  const visibleClauses = tab === 'flagged' ? clauses.filter(isFlagged) : clauses;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-100">Clause List</h2>
          <p className="text-xs text-neutral-500">Extracted from document text, matched against clause library</p>
        </div>
        <div className="flex rounded-md border border-neutral-700 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`rounded px-3 py-1 ${tab === 'all' ? 'bg-neutral-700 text-neutral-100' : 'text-neutral-400'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTab('flagged')}
            className={`rounded px-3 py-1 ${tab === 'flagged' ? 'bg-neutral-700 text-neutral-100' : 'text-neutral-400'}`}
          >
            Flagged
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 border-b border-neutral-800 px-5 py-4 text-center">
        <div>
          <p className="text-xl font-semibold text-neutral-100">{stats.total}</p>
          <p className="text-[11px] text-neutral-500">Clauses Extracted</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-emerald-400">{stats.standard}</p>
          <p className="text-[11px] text-neutral-500">Standard Match</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-amber-400">{stats.deviated}</p>
          <p className="text-[11px] text-neutral-500">Deviated</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-red-400">{stats.missing}</p>
          <p className="text-[11px] text-neutral-500">Missing</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-neutral-300">{stats.nonStandard}</p>
          <p className="text-[11px] text-neutral-500">Non-standard</p>
        </div>
      </div>

      {visibleClauses.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-neutral-500">No clauses to show.</p>
      ) : (
        <ul>
          {visibleClauses.map((clause) => {
            const dotClass = STATUS_DOT_STYLES[clause.libraryMatchStatus] || STATUS_DOT_STYLES['Non-standard'];
            const matchClass = MATCH_STATUS_STYLES[clause.libraryMatchStatus] || MATCH_STATUS_STYLES['Non-standard'];
            const riskClass = RISK_TEXT_STYLES[clause.riskScore] || 'text-neutral-300';
            const isSelected = clause.clauseId === selectedClauseId;
            return (
              <li key={clause.clauseId} className="border-b border-neutral-800 last:border-b-0">
                <button
                  type="button"
                  onClick={() => onSelect(clause.clauseId)}
                  className={`flex w-full items-center justify-between px-5 py-3 text-left hover:bg-neutral-800/60 ${
                    isSelected ? 'bg-neutral-800/80' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${dotClass}`}>
                      {(clause.clauseCategory || 'O').charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-neutral-100">{clause.clauseCategory || 'Other'}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${matchClass}`}>
                          {clause.libraryMatchStatus}
                        </span>
                        <MandatoryClauseFlagBadge isMandatory={clause.isMandatory} status={clause.libraryMatchStatus} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${riskClass}`}>{clause.riskScore}</p>
                    <p className="text-[10px] uppercase tracking-wide text-neutral-500">Risk Score</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
