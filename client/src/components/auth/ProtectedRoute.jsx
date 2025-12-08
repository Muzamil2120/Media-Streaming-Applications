import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // For now, we'll use a simple check
  // Later you can integrate with your AuthContext
  const isAuthenticated = localStorage.getItem('token') || true; // Temporary: always allow
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;