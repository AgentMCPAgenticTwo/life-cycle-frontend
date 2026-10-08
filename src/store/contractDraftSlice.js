import { create } from 'zustand';

// Shape matches the contractDraftSlice contract: formData mirrors
// CreateContractRequest exactly (see services/contractsService.js), plus
// validationErrors for the FieldErrorResponse[] surfaced on a blocked Save.
const EMPTY_FORM_DATA = {
  contractType: '',
  industry: '',
  templateId: null,
  thirdPartyPaperFileId: null,
  counterpartySearch: '',
  counterpartyId: null,
  counterpartyName: '',
  counterpartyEmail: '',
  counterpartyCompany: '',
  counterpartyAddress: '',
  counterpartyGstTaxId: '',
  contractOwnerId: null,
  contractValue: '',
  currency: '',
  startDate: '',
  endDate: '',
  renewalType: '',
  noticePeriod: '',
  dueDate: '',
};

export const useContractDraftStore = create((set) => ({
  formData: { ...EMPTY_FORM_DATA },
  validationErrors: [],

  setField: (field, value) => set((state) => ({ formData: { ...state.formData, [field]: value } })),

  setValidationErrors: (validationErrors) => set({ validationErrors }),

  reset: () => set({ formData: { ...EMPTY_FORM_DATA }, validationErrors: [] }),
}));
