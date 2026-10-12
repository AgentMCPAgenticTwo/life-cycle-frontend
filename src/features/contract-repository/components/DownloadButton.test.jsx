import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DownloadButton from '@/features/contract-repository/components/DownloadButton';

describe('DownloadButton', () => {
  it('renders enabled and fires onClick', () => {
    const onClick = vi.fn();
    render(<DownloadButton enabled onClick={onClick} />);
    const button = screen.getByRole('button', { name: /download/i });
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled with the File unavailable comment for oversized/corrupted/missing docs', () => {
    render(<DownloadButton enabled={false} comment="File unavailable" />);
    const button = screen.getByRole('button', { name: /download/i });
    expect(button.disabled).toBe(true);
    expect(screen.getByText('File unavailable')).toBeTruthy();
  });

  it('shows a downloading state and disables the button while the request is in flight', () => {
    render(<DownloadButton enabled isLoading />);
    const button = screen.getByRole('button', { name: /downloading/i });
    expect(button.disabled).toBe(true);
  });
});
