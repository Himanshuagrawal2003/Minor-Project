import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    // Redirect to login but save the current location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Role mismatch - redirect to their own dashboard or login
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
}
