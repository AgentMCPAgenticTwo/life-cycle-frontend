import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Gate around every authenticated route (see App.jsx): restores the session
 * from the refresh cookie on first mount (so a page reload stays signed in),
 * redirects to /login when there is no session, and forces a signed-in user
 * with mustChangePassword through /change-password before any other page.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing, user, restoreSession } = useAuth();
  const location = useLocation();
  const hasAttemptedRestore = useRef(false);

  useEffect(() => {
    if (!hasAttemptedRestore.current) {
      hasAttemptedRestore.current = true;
      restoreSession();
    }
  }, [restoreSession]);

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
