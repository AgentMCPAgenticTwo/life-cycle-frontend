import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

describe('AccessDeniedPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays the permission-denied message and no other screen content', () => {
    render(
      <MemoryRouter>
        <AccessDeniedPage />
      </MemoryRouter>
    );
    expect(screen.getByText('You do not have permission to view this page.')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('links back to the Dashboard', () => {
    render(
      <MemoryRouter>
        <AccessDeniedPage />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /back to dashboard/i });
    expect(link.getAttribute('href')).toBe('/');
  });

  it('auto-redirects to the Dashboard after the delay', () => {
    vi.useFakeTimers();
    const { container } = render(
      <MemoryRouter initialEntries={['/access-denied']}>
        <AccessDeniedPage />
      </MemoryRouter>
    );
    expect(container.textContent).toContain('You do not have permission to view this page.');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
  });
});
