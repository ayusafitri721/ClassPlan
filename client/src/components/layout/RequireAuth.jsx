import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '../../hooks/queries.js';
import { PageLoading } from '../ui/Feedback.jsx';

export function RequireAuth({ children }) {
  const me = useMe();
  const location = useLocation();

  if (me.isLoading) return <PageLoading label="Memeriksa sesi" />;
  if (me.isError) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}
