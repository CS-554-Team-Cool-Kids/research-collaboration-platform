import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const NotFound = () => {
  const { authState } = useAuth();
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>The page you're looking for does not exist.</p>
      {authState && authState.isAuthenticated ? (
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      ) : (
        <Link to="/" className="btn btn-primary">
          Go to Home
        </Link>
      )}
    </div>
  );
};

export default NotFound;
