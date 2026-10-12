import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IntegrationConnectForm from './IntegrationConnectForm';

afterEach(() => {
  vi.clearAllMocks();
});

describe('IntegrationConnectForm', () => {
  it('requires an API Key before submitting', () => {
    const onSubmit = vi.fn();
    render(<IntegrationConnectForm integrationName="Salesforce" onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /connect/i }));

    expect(screen.getByRole('alert').textContent).toContain('API Key is required.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('masks credential inputs as password fields', () => {
    render(<IntegrationConnectForm integrationName="Salesforce" onSubmit={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByLabelText(/API Key/i).getAttribute('type')).toBe('password');
    expect(screen.getByLabelText(/API Secret/i).getAttribute('type')).toBe('password');
  });

  it('submits trimmed credentials when the API Key is present', () => {
    const onSubmit = vi.fn();
    render(<IntegrationConnectForm integrationName="HubSpot" onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/API Key/i), { target: { value: ' secret-key ' } });
    fireEvent.click(screen.getByRole('button', { name: /connect/i }));

    expect(onSubmit).toHaveBeenCalledWith({ apiKey: 'secret-key', apiSecret: undefined });
  });

  it('shows the failure message from the caller on a failed connection attempt', () => {
    render(
      <IntegrationConnectForm
        integrationName="ERP"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        error="Connection failed. Please check your credentials and try again"
      />
    );

    expect(screen.getByText('Connection failed. Please check your credentials and try again')).toBeTruthy();
  });

  it('disables the submit button while a connection attempt is in flight', () => {
    render(
      <IntegrationConnectForm integrationName="DocuSign" onSubmit={vi.fn()} onClose={vi.fn()} isSubmitting />
    );

    expect(screen.getByRole('button', { name: /connecting/i }).disabled).toBe(true);
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<IntegrationConnectForm integrationName="Salesforce" onSubmit={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
