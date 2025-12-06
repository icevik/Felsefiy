import { Navigate, useLocation } from 'react-router-dom';

function RequireAuth({ children }) {
  const location = useLocation();
  let isAuthenticated = false;

  try {
    const token = window.localStorage.getItem('authToken');
    isAuthenticated = !!token;
  } catch (error) {
    console.error('Failed to read auth token:', error);
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
