import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component for authenticated and role-based routes
 * @param {string[]} allowedRoles Optional array of roles permitted to view this route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-white">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-dark-300 font-medium animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to their home dashboard
    console.warn(`Access forbidden for role: ${user.role}. Allowed: ${allowedRoles}`);
    const redirectPath = user.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
