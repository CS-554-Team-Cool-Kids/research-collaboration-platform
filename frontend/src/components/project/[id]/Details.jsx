import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActionBar from "./ActionBar_2";
import { useQuery, useMutation } from "@apollo/client";
import "../../../assets/css/sidebar.css";
import queries from "../../../queries";

const ProjectDetails = () => {
  const { id: projectId } = useParams(); // Extract projectId from the URL

  const { data, loading, error, refetch } = useQuery(
    queries.GET_PROJECT_BY_ID,
    {
      variables: { id: projectId },
      fetchPolicy: "network-only",
    }
  );

  if (loading) return <p className="loader">Loading...</p>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <main className="dashboard">
      <ActionBar
        projectId={projectId}
        projectTitle={data.getProjectById.title}
      />
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
