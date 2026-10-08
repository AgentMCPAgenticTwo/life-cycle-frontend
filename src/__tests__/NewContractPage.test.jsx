import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewContractPage from '@/pages/NewContractPage';
import { http } from '@/services/http';
import { useContractDraftStore } from '@/store/contractDraftSlice';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const ACTIVE_TEMPLATE = {
  id: '11111111-1111-1111-1111-111111111111',
  templateName: 'MSA – Service – Standard v4',
  templateCategory: 'MSA',
  documentFormat: 'DOCX',
  templateBody: 'Body',
  status: 'Active',
  lastModifiedBy: 'Legal Admin',
  lastModifiedDate: '2026-01-01T00:00:00Z',
};

const OWNER = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Ritika Shah',
  email: 'ritika@example.com',
  role: 'CONTRACT_OWNER',
};

const COUNTERPARTY = {
  id: '33333333-3333-3333-3333-333333333333',
  name: 'Nimbus Freight Logistics Pvt Ltd',
  email: 'accounts@nimbusfreight.com',
  company: 'Nimbus Freight Logistics Pvt Ltd',
  address: 'Plot 42, Logistics Park, Bengaluru',
  gstTaxId: '29AACCN1234F1Z8',
};

const CREATED_CONTRACT = {
  id: '44444444-4444-4444-4444-444444444444',
  status: 'Draft',
};

function mockEndpoints({ templates = { items: [ACTIVE_TEMPLATE] }, owners = { items: [OWNER] }, counterpartySearch = { items: [] } } = {}) {
  http.get.mockImplementation((path) => {
    if (path.startsWith('/api/v1/templates')) return Promise.resolve(templates);
    if (path.startsWith('/api/v1/users')) return Promise.resolve(owners);
    if (path.startsWith('/api/v1/counterparties')) return Promise.resolve(counterpartySearch);
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/contracts/new']}>
      <NewContractPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useContractDraftStore.getState().reset();
});

describe('NewContractPage', () => {
  it('renders the New Contract Creation form', () => {
    mockEndpoints();
    renderPage();

    expect(screen.getByText('New Contract Creation')).toBeTruthy();
    expect(screen.getByText('Contract Basics')).toBeTruthy();
    expect(screen.getByText('Counterparty')).toBeTruthy();
    expect(screen.getByText('Commercial Details')).toBeTruthy();
    expect(screen.getByText('Scheduling')).toBeTruthy();
  });

  it('blocks Save and highlights missing mandatory fields when the form is empty', async () => {
    mockEndpoints();
    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    await waitFor(() => screen.getByText('Please fill all mandatory fields'));
    expect(http.post).not.toHaveBeenCalled();
  });

  it('filters the Template dropdown to Active templates for the selected Contract Type/Industry', async () => {
    mockEndpoints();
    renderPage();

    fireEvent.change(screen.getByDisplayValue('Select contract type'), { target: { value: 'MSA' } });
    fireEvent.change(screen.getByDisplayValue('Select industry'), { target: { value: 'Service' } });

    await waitFor(() => {
      const templateCalls = http.get.mock.calls.filter(([path]) => path.startsWith('/api/v1/templates'));
      expect(templateCalls.length).toBeGreaterThan(0);
      expect(templateCalls[templateCalls.length - 1][0]).toContain('status=Active');
    });

    await waitFor(() => screen.getByText('MSA – Service – Standard v4'));
  });

  it('shows the no-active-templates message and blocks Template selection', async () => {
    mockEndpoints({ templates: { items: [] } });
    renderPage();

    fireEvent.change(screen.getByDisplayValue('Select contract type'), { target: { value: 'NDA' } });
    fireEvent.change(screen.getByDisplayValue('Select industry'), { target: { value: 'Product' } });

    await waitFor(() =>
      screen.getByText('No active templates available for this combination. Please upload third party paper.')
    );
  });

  it('blocks Save when End Date is earlier than Start Date', async () => {
    mockEndpoints();
    renderPage();

    fireEvent.change(screen.getByDisplayValue('Select contract type'), { target: { value: 'MSA' } });
    fireEvent.change(screen.getByDisplayValue('Select industry'), { target: { value: 'Service' } });
    await waitFor(() => screen.getByText('MSA – Service – Standard v4'));
    fireEvent.change(screen.getByDisplayValue('Select template'), { target: { value: ACTIVE_TEMPLATE.id } });

    fireEvent.change(screen.getByLabelText(/Counterparty Search/), { target: { value: COUNTERPARTY.name } });
    fireEvent.change(screen.getByLabelText(/Counterparty Name/), { target: { value: COUNTERPARTY.name } });
    fireEvent.change(screen.getByLabelText(/Counterparty Email/), { target: { value: COUNTERPARTY.email } });
    fireEvent.change(screen.getByLabelText(/Counterparty Company/), { target: { value: COUNTERPARTY.company } });

    fireEvent.change(screen.getByDisplayValue('Select contract owner'), { target: { value: OWNER.id } });
    fireEvent.change(screen.getByLabelText(/Contract Value/), { target: { value: '165000' } });
    fireEvent.change(screen.getByDisplayValue('Select currency'), { target: { value: 'USD' } });
    fireEvent.change(screen.getByDisplayValue('Select renewal type'), { target: { value: 'None' } });

    const dateInputs = screen.getAllByPlaceholderText('DD/MM/YYYY');
    fireEvent.change(dateInputs[0], { target: { value: '10/03/2026' } }); // Start Date
    fireEvent.change(dateInputs[1], { target: { value: '01/01/2026' } }); // End Date
    fireEvent.change(dateInputs[2], { target: { value: '22/10/2099' } }); // Due Date

    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    await waitFor(() => screen.getByText('End date cannot be earlier than start date'));
  });

  it('creates the contract and shows success on a fully valid Save', async () => {
    mockEndpoints();
    http.post.mockImplementation((path) => {
      if (path === '/api/v1/contracts') return Promise.resolve(CREATED_CONTRACT);
      if (path === '/api/v1/counterparties') return Promise.resolve({ id: COUNTERPARTY.id, ...COUNTERPARTY });
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });

    renderPage();

    fireEvent.change(screen.getByDisplayValue('Select contract type'), { target: { value: 'MSA' } });
    fireEvent.change(screen.getByDisplayValue('Select industry'), { target: { value: 'Service' } });
    await waitFor(() => screen.getByText('MSA – Service – Standard v4'));
    fireEvent.change(screen.getByDisplayValue('Select template'), { target: { value: ACTIVE_TEMPLATE.id } });

    fireEvent.change(screen.getByLabelText(/Counterparty Search/), { target: { value: COUNTERPARTY.name } });
    fireEvent.change(screen.getByLabelText(/Counterparty Name/), { target: { value: COUNTERPARTY.name } });
    fireEvent.change(screen.getByLabelText(/Counterparty Email/), { target: { value: COUNTERPARTY.email } });
    fireEvent.change(screen.getByLabelText(/Counterparty Company/), { target: { value: COUNTERPARTY.company } });

    fireEvent.change(screen.getByDisplayValue('Select contract owner'), { target: { value: OWNER.id } });
    fireEvent.change(screen.getByLabelText(/Contract Value/), { target: { value: '165000' } });
    fireEvent.change(screen.getByDisplayValue('Select currency'), { target: { value: 'USD' } });

    const dateInputs = screen.getAllByPlaceholderText('DD/MM/YYYY');
    fireEvent.change(dateInputs[0], { target: { value: '14/03/2025' } }); // Start Date
    fireEvent.change(dateInputs[1], { target: { value: '13/03/2027' } }); // End Date
    fireEvent.change(screen.getByDisplayValue('Select renewal type'), { target: { value: 'None' } });
    fireEvent.change(dateInputs[2], { target: { value: '22/10/2099' } }); // Due Date

    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    await waitFor(() => expect(http.post).toHaveBeenCalledWith('/api/v1/contracts', expect.objectContaining({
      contractType: 'MSA',
      industry: 'Service',
      contractOwnerId: OWNER.id,
    })));
  });
});
