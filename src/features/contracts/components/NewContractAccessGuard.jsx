import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHeaders } from '@/services/http';

/**
 * Blocks unauthorized roles from rendering the New Contract Creation screen
 * and redirects to the Dashboard (UC2-AF-007 / UC2-BR-013). Only Tenant Admin
 * and Contract Owner may render `children`; everyone else (Legal Reviewer,
 * Approver, Signer, External Party) is redirected before any field renders.
 */
export default function NewContractAccessGuard({ allowedRoles, children }) {
  const navigate = useNavigate();
  const isAllowed = allowedRoles.includes(authHeaders.role);

  useEffect(() => {
    if (!isAllowed) {
      navigate('/', {
        replace: true,
        state: { accessDeniedMessage: 'You do not have permission to create a contract' },
      });
    }
  }, [isAllowed, navigate]);

  if (!isAllowed) return null;
  return children;
}
