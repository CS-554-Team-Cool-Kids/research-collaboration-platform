import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ProfessorDashboard() {
  const { authState } = useAuth();
  console.log(authState);
  const navigate = useNavigate();
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/authentication/login");
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <div>
      <h1>Professor Initial Page</h1>
    </div>
  );
}

export default ProfessorDashboard;
