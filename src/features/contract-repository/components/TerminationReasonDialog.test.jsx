import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TerminationReasonDialog from '@/features/contract-repository/components/TerminationReasonDialog';
import { terminateContract } from '@/services/contractRepositoryService';

vi.mock('@/services/contractRepositoryService', () => ({
  terminateContract: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toISOString().slice(0, 10);
}

describe('TerminationReasonDialog (UC9-AF-006, UC9-BR-018, UC9-FV-001/002/003)', () => {
  it('opens showing empty Termination Reason and Effective Termination Date fields', () => {
    render(<TerminationReasonDialog contractId="c1" onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByLabelText(/termination reason/i).value).toBe('');
    expect(screen.getByLabelText(/effective termination date/i).value).toBe('');
  });

  it('blocks confirm and shows an error when Termination Reason is empty', async () => {
    render(<TerminationReasonDialog contractId="c1" onClose={vi.fn()} onConfirm={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/effective termination date/i), { target: { value: futureDate() } });
    fireEvent.click(screen.getByRole('button', { name: /confirm termination/i }));

    expect(await screen.findByText(/termination reason is required/i)).toBeTruthy();
    expect(terminateContract).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/effective termination date/i).value).toBe(futureDate());
  });

  it('blocks confirm with an error when Effective Termination Date is earlier than today', async () => {
    render(<TerminationReasonDialog contractId="c1" onClose={vi.fn()} onConfirm={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/termination reason/i), { target: { value: 'Breach of SLA' } });
    fireEvent.change(screen.getByLabelText(/effective termination date/i), { target: { value: '2000-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm termination/i }));

    expect(await screen.findByText(/must be on or after today/i)).toBeTruthy();
    expect(terminateContract).not.toHaveBeenCalled();
  });

  it('submits the termination when reason and a valid future date are provided', async () => {
    terminateContract.mockResolvedValue({
      originalContractId: 'c1',
      originalContractStatus: 'Terminated',
      linkedContractId: 'c2',
      linkedContractReference: 'c2',
    });
    const onConfirm = vi.fn();
    render(<TerminationReasonDialog contractId="c1" onClose={vi.fn()} onConfirm={onConfirm} />);

    fireEvent.change(screen.getByLabelText(/termination reason/i), { target: { value: 'Breach of SLA' } });
    fireEvent.change(screen.getByLabelText(/effective termination date/i), { target: { value: futureDate() } });
    fireEvent.click(screen.getByRole('button', { name: /confirm termination/i }));

    await waitFor(() =>
      expect(terminateContract).toHaveBeenCalledWith('c1', {
        terminationReason: 'Breach of SLA',
        effectiveTerminationDate: futureDate(),
      })
    );
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<TerminationReasonDialog contractId="c1" onClose={onClose} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
