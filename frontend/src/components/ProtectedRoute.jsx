import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// Gates routes that require authentication. Redirects to /login, preserving
// where the user was trying to go.
export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner full />;
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
