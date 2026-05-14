import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * Wraps any route that requires authentication.
 * If the user is not authenticated, redirects to /login.
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
