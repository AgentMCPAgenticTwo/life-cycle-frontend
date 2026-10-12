import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccessDeniedView from '@/features/contract-repository/components/AccessDeniedView';

describe('AccessDeniedView', () => {
  it('displays the permission-denied message', () => {
    render(
      <MemoryRouter>
        <AccessDeniedView />
      </MemoryRouter>
    );
    expect(screen.getByText('You do not have permission to view this contract.')).toBeTruthy();
  });

  it('links back to the Contract Repository list', () => {
    render(
      <MemoryRouter>
        <AccessDeniedView />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /back to contract repository/i });
    expect(link.getAttribute('href')).toBe('/contract-repository');
  });

  it('never renders contract data alongside the message', () => {
    render(
      <MemoryRouter>
        <AccessDeniedView />
      </MemoryRouter>
    );
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
