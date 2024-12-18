import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ActionBar from "./ActionBar_2"; // Adjust path based on your directory structure
import { useQuery } from "@apollo/client";
import queries from "../../../queries";

const ProjectLayout = () => {
  const { id: projectId } = useParams(); // Extract projectId from the URL

  const { data, loading, error, refetch } = useQuery(
    queries.GET_PROJECT_BY_ID,
    {
      variables: { id: projectId },
      fetchPolicy: "network-only",
    }
  );

  if (loading) {
    return (
      <main className="dashboard">
        <ActionBar />
        <div className="container-fluid my-3">
          <div className="d-card glassEffect">
            <div className="d-card-header">Loading...</div>
            <div className="d-card-body">Loading Project Details</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <ActionBar />
        <div className="container-fluid my-3">
          <div className="d-card glassEffect">
            <div className="d-card-header">Error</div>
            <div className="d-card-body">{error.message}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <ActionBar
        projectId={projectId}
        projectTitle={data.getProjectById.title}
      />
      <div className="container-fluid my-3">
        <Outlet context={{ refetch }} />
      </div>
    </main>
  );
};

export default ProjectLayout;
