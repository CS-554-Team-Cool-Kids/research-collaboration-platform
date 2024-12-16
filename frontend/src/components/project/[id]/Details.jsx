import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActionBar from "./ActionBar_2";
import "../../../assets/css/sidebar.css";

const ProjectDetails = () => {
  const { id: projectId } = useParams(); // Extract projectId from the URL
  return (
    <main className="dashboard">
      <ActionBar projectId={projectId} />
      <div className="container-fluid my-3">
        <div className="d-card glassEffect">
          <div className="d-card-header">Home</div>
          <div className="d-card-body"></div>
        </div>
      </div>
    </main>
  );
};

export default ProjectDetails;
