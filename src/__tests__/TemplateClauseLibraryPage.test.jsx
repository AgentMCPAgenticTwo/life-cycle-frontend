import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TemplateClauseLibraryPage from '@/pages/TemplateClauseLibraryPage';
import { http, authHeaders } from '@/services/http';
import { useTemplateLibraryStore } from '@/store/templateLibrarySlice';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
    authHeaders: { role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' },
  };
});

const TEMPLATE = {
  id: '11111111-1111-1111-1111-111111111111',
  templateName: 'Master Services Agreement',
  templateCategory: 'Service Agreement',
  documentFormat: 'DOCX',
  templateBody: 'Body text',
  status: 'Active',
  lastModifiedBy: 'Priya Nandakumar',
  lastModifiedDate: '2025-03-14T00:00:00Z',
};

const CLAUSE = {
  id: '22222222-2222-2222-2222-222222222222',
  clauseName: 'Limitation of Liability',
  clauseCategory: 'Liability',
  standardText: 'Standard wording',
  fallbackText1: '',
  fallbackText2: '',
  riskLevel: 'High',
  mandatory: true,
  status: 'Active',
  lastModifiedBy: 'Daniel Osei',
  lastModifiedDate: '2025-09-20T00:00:00Z',
};

function mockEndpoints({ templates = { items: [TEMPLATE] }, clauses = { items: [CLAUSE] } } = {}) {
  http.get.mockImplementation((path) => {
    if (path.startsWith('/api/v1/templates')) return Promise.resolve(templates);
    if (path.startsWith('/api/v1/clauses')) return Promise.resolve(clauses);
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/settings/template-clause-library']}>
      <TemplateClauseLibraryPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authHeaders.role = 'TENANT_ADMIN';
  useTemplateLibraryStore.getState().clearSelection();
  useTemplateLibraryStore.setState({ activeTab: 'templates' });
});

describe('TemplateClauseLibraryPage', () => {
  it('renders the Templates tab by default with the grid columns', async () => {
    mockEndpoints();
    renderPage();

    expect(screen.getByRole('heading', { name: 'Template & Clause Library' })).toBeTruthy();
    await waitFor(() => screen.getByText('Master Services Agreement'));
    expect(screen.getByText('Category')).toBeTruthy();
    expect(screen.getByText('Last Modified By')).toBeTruthy();
  });

  it('switches to the Clause Library tab and shows its columns', async () => {
    mockEndpoints();
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Clause Library' }));
    await waitFor(() => screen.getByText('Limitation of Liability'));
    expect(screen.getByText('Risk Level')).toBeTruthy();
    expect(screen.getByText('Mandatory')).toBeTruthy();
  });

  it('blocks access for an unauthorized role', () => {
    authHeaders.role = 'APPROVER';
    mockEndpoints();
    renderPage();

    expect(screen.getByText('You do not have permission to access this screen.')).toBeTruthy();
    expect(screen.queryByText('Template & Clause Library')).toBeFalsy();
  });

  it('blocks Save when Template Name is left blank', async () => {
    mockEndpoints();
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '+ New Template' }));
    await waitFor(() => screen.getByRole('heading', { name: 'New Template' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    await waitFor(() => screen.getByText('Template Name is required.'));
    expect(http.post).not.toHaveBeenCalled();
  });

  it('creates a new template and shows the success message', async () => {
    mockEndpoints();
    http.post.mockImplementation((path) => {
      if (path === '/api/v1/templates') return Promise.resolve({ ...TEMPLATE, id: '33333333-3333-3333-3333-333333333333' });
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '+ New Template' }));
    await waitFor(() => screen.getByRole('heading', { name: 'New Template' }));

    fireEvent.change(screen.getByPlaceholderText('e.g. Standard Services Master Agreement'), {
      target: { value: 'NDA Standard' },
    });
    fireEvent.change(screen.getByDisplayValue('Select category…'), { target: { value: 'NDA' } });
    fireEvent.change(screen.getByDisplayValue('Select format…'), { target: { value: 'DOCX' } });
    fireEvent.change(screen.getByPlaceholderText(/This Service Agreement/), { target: { value: 'Body' } });

    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    await waitFor(() => expect(http.post).toHaveBeenCalledWith('/api/v1/templates', expect.objectContaining({
      templateName: 'NDA Standard',
      templateCategory: 'NDA',
      documentFormat: 'DOCX',
      templateBody: 'Body',
    })));
    await waitFor(() => screen.getByText('Template saved successfully'));
  });

  it('opens the Clause Editor and requires mandatory fields before Save', async () => {
    mockEndpoints();
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '+ New Clause' }));
    await waitFor(() => screen.getByRole('heading', { name: 'New Clause' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    await waitFor(() => screen.getByText('Clause Name is required.'));
    expect(http.post).not.toHaveBeenCalled();
  });
});
