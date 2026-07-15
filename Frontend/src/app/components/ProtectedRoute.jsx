import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { api } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

export function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await api.checkHrAuth();
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <LoadingSpinner message="Checking HR session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/hr/login" replace />;
  }

  return children;
}
