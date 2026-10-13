import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SidebarNav from '@/shared/components/SidebarNav';

describe('SidebarNav', () => {
  it('renders links to the main app sections', () => {
    render(
      <MemoryRouter>
        <SidebarNav isOpen={false} onClose={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('link', { name: 'Contracts' }).getAttribute('href')).toBe('/contracts');
    expect(screen.getByRole('link', { name: 'Tracker' }).getAttribute('href')).toBe('/tracker');
    expect(screen.getByRole('link', { name: 'Admin' }).getAttribute('href')).toBe('/settings/admin');
  });

  it('calls onClose when the mobile overlay is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <SidebarNav isOpen onClose={onClose} />
      </MemoryRouter>
    );
    fireEvent.click(container.querySelector('[aria-hidden="true"]'));
    expect(onClose).toHaveBeenCalled();
  });
});
