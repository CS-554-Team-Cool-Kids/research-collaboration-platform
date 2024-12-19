import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (!authState || !authState.isAuthenticated) {
    // Redirect to login and save the intended route
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authState.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const { authState } = useAuth();

  if (authState && authState.isAuthenticated) {
    // Redirect authenticated users to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

export { RedirectIfAuthenticated };
