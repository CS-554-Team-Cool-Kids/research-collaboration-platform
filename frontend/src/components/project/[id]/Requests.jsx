import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActionBar from "./ActionBar_2";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../../../queries";

const Requests = () => {
  const { id: projectId } = useParams(); // Extract projectId from the URL

  const { data, loading, error, refetch } = useQuery(
    queries.GET_PROJECT_BY_ID,
    {
      variables: { id: projectId },
      fetchPolicy: "network-only",
    }
  );

  const [changeStatus] = useMutation(queries.CHANGE_APPLICATION_STATUS);

  useEffect(() => {
    if (data) {
      console.log(data.getProjectById.applications);
    }
  }, [data]);

  const handleAccept = async (applicationId) => {
    try {
      await changeStatus({
        variables: { id: applicationId, status: "APPROVED" },
      });
      await refetch();
    } catch (err) {
      console.error("Error accepting application:", err);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await changeStatus({
        variables: { id: applicationId, status: "REJECTED" },
      });
      await refetch();
    } catch (err) {
      console.error("Error rejecting application:", err);
    }
  };

  return (
    <main className="dashboard">
      <ActionBar projectId={projectId} />
      <div className="container-fluid my-3">
        <div className="d-card glassEffect">
          <div className="d-card-header">
            <h2>Requests</h2>
          </div>
          <div className="d-card-body">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error loading requests: {error.message}</p>
            ) : (
              <div className="col-12">
                {data.getProjectById.applications.map((application, index) => (
                  <div key={application._id} className="row mt-3">
                    <div className="col my-auto">
                      {application.applicant.firstName}{" "}
                      {application.applicant.lastName}
                    </div>
                    <div className="col-auto">
                      <button
                        className="btn btn-success mx-2"
                        onClick={() => handleAccept(application._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger mx-2"
                        onClick={() => handleReject(application._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Requests;
