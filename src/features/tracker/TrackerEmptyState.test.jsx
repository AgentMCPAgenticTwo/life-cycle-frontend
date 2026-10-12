import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TrackerEmptyState from './TrackerEmptyState';

describe('TrackerEmptyState', () => {
  it('renders the no-contracts message (UC10-AF-001)', () => {
    render(<TrackerEmptyState message="No contract data available to display." />);
    expect(screen.getByText('No contract data available to display.')).toBeDefined();
  });

  it('renders the no-records-for-period message (UC10-AF-003)', () => {
    render(<TrackerEmptyState message="No records found for the selected period." />);
    expect(screen.getByText('No records found for the selected period.')).toBeDefined();
  });

  it('renders the conflicting-filters message (UC10-AF-005)', () => {
    render(<TrackerEmptyState message="No records match the selected filters." />);
    expect(screen.getByText('No records match the selected filters.')).toBeDefined();
  });

  it('exposes a status role so screen readers announce the empty state', () => {
    render(<TrackerEmptyState message="No contract data available to display." />);
    expect(screen.getByRole('status')).toBeDefined();
  });
});
