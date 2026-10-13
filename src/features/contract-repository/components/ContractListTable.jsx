import { useState } from 'react';
import StatusBadge from '@/features/contract-repository/components/StatusBadge';
import AddFolderTagDialog from '@/features/contract-repository/components/AddFolderTagDialog';
import { formatCurrency, formatDate, formatDateTime } from '@/features/contract-repository/utils/format';
import { useAuth } from '@/shared/hooks/useAuth';

const COLUMNS = [
  { key: 'contractName', label: 'Contract Name' },
  { key: 'counterparty', label: 'Counterparty' },
  { key: 'status', label: 'Status' },
  { key: 'value', label: 'Value' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'owner', label: 'Owner' },
  { key: 'lastModified', label: 'Last Modified' },
];

const FOLDER_TAG_MANAGER_ROLES = ['TENANT_ADMIN', 'CONTRACT_OWNER'];

/**
 * Sortable, navigable table of contracts (UC8-MF-001). Clicking a row opens
 * the contract; clicking the folder/tag icon opens the Add Folder/Tag dialog
 * for that row without navigating away (UC8-BR-004 / UC8-BR-007 / UC8-BR-008).
 */
export default function ContractListTable({ contracts, onRowClick, sortBy, sortDirection, onSort }) {
  const { role } = useAuth();
  const [taggingContractId, setTaggingContractId] = useState(null);
  const canManageFolderTags = FOLDER_TAG_MANAGER_ROLES.includes(role);

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="min-w-full divide-y divide-neutral-800 text-sm">
        <thead className="bg-neutral-900/80 text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            {COLUMNS.map((column) => {
              const isActive = sortBy === column.key;
              return (
                <th key={column.key} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => onSort?.(column.key)}
                    className={`flex items-center gap-1 ${isActive ? 'text-emerald-400' : ''}`}
                  >
                    {column.label}
                    {isActive && <span aria-hidden="true">{sortDirection === 'ASC' ? '↑' : '↓'}</span>}
                  </button>
                </th>
              );
            })}
            {canManageFolderTags && <th className="px-4 py-3 font-medium text-right">Tag</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {contracts.map((contract) => (
            <tr
              key={contract.contractId}
              onClick={() => onRowClick?.(contract.contractId)}
              className="cursor-pointer transition-colors hover:bg-neutral-900/70"
            >
              <td className="px-4 py-3 font-medium text-neutral-100">
                {contract.contractName}
                {contract.indexingInProgress && (
                  <span
                    className="ml-2 align-middle text-[10px] font-normal uppercase tracking-wide text-amber-400"
                    title="Document index still processing"
                  >
                    Indexing…
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-neutral-300">{contract.counterparty}</td>
              <td className="px-4 py-3">
                <StatusBadge status={contract.status} />
              </td>
              <td className="px-4 py-3 text-neutral-200">{formatCurrency(contract.value)}</td>
              <td className="px-4 py-3 text-neutral-400">{formatDate(contract.startDate)}</td>
              <td className="px-4 py-3 text-neutral-400">{formatDate(contract.endDate)}</td>
              <td className="px-4 py-3 text-neutral-300">{contract.owner}</td>
              <td className="px-4 py-3 text-neutral-400">{formatDateTime(contract.lastModified)}</td>
              {canManageFolderTags && (
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setTaggingContractId(contract.contractId);
                    }}
                    className="rounded-md border border-neutral-700 px-2 py-1 text-xs font-medium text-neutral-300 hover:border-neutral-500"
                  >
                    + Tag
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {taggingContractId && (
        <AddFolderTagDialog contractId={taggingContractId} onClose={() => setTaggingContractId(null)} />
      )}
    </div>
  );
}
