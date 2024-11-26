import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(authState.user.role)) {
    <Navigate to="/home" />;
  }

  const route = `/${authState.user.role.toLowerCase()}Dashboard`;
  return <Navigate to={route} />;

  return children;
};

export default ProtectedRoute;
