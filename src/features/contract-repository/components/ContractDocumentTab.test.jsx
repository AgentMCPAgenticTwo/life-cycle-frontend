import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContractDocumentTab from '@/features/contract-repository/components/ContractDocumentTab';
import { getContractDocument, getDocumentDownload } from '@/services/contractRepositoryService';

vi.mock('@/services/contractRepositoryService', () => ({
  getContractDocument: vi.fn(),
  getDocumentDownload: vi.fn(),
}));

const BASE_DOC = {
  contractId: 'c1',
  documentUrl: 'https://files.example.com/doc.pdf',
  fileName: 'MSA-2025-0412_v6_executed.pdf',
  fileType: 'PDF',
  fileSizeBytes: 1024,
  isOversized: false,
  isCorruptedOrMissing: false,
  downloadEnabled: true,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('ContractDocumentTab — download behavior (UC8-AF-005, UC8-BR-006)', () => {
  it('enables Download and triggers the download endpoint for a healthy document', async () => {
    getContractDocument.mockResolvedValue(BASE_DOC);
    getDocumentDownload.mockResolvedValue({ success: true, fileUrl: 'https://files.example.com/doc.pdf' });

    render(<ContractDocumentTab contractId="c1" />);
    const button = await screen.findByRole('button', { name: /^download$/i });
    expect(button.disabled).toBe(false);

    fireEvent.click(button);
    await waitFor(() => expect(getDocumentDownload).toHaveBeenCalledWith('c1'));
    expect(screen.queryByText(/could not be retrieved/i)).toBeNull();
  });

  it('shows a disabled Download button with "File unavailable" for an oversized document', async () => {
    getContractDocument.mockResolvedValue({
      ...BASE_DOC,
      isOversized: true,
      downloadEnabled: false,
      unavailableComment: 'File unavailable',
    });

    render(<ContractDocumentTab contractId="c1" />);
    const button = await screen.findByRole('button', { name: /download/i });
    expect(button.disabled).toBe(true);
    expect(screen.getAllByText('File unavailable').length).toBeGreaterThan(0);
  });

  it('keeps Download enabled for a corrupted/missing document but shows the retrieval error on click', async () => {
    getContractDocument.mockResolvedValue({ ...BASE_DOC, isCorruptedOrMissing: true });
    getDocumentDownload.mockResolvedValue({
      success: false,
      errorMessage: 'This document could not be retrieved. Please contact your administrator.',
    });

    render(<ContractDocumentTab contractId="c1" />);
    const button = await screen.findByRole('button', { name: /^download$/i });
    expect(button.disabled).toBe(false);

    fireEvent.click(button);
    expect(
      await screen.findByText('This document could not be retrieved. Please contact your administrator.')
    ).toBeTruthy();
  });
});
