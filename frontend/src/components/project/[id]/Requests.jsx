import React, { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useMutation } from "@apollo/client";
import queries from "../../../queries";

const Requests = () => {
  const { refetch } = useOutletContext(); // Get refetch function from Outlet context
  const [data, setData] = useState(null); // Using null as initial state for clearer checks
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reloadData = async () => {
      try {
        const { data: refetchedData } = await refetch();
        if (refetchedData !== data) {
          setData(refetchedData);
        }
      } catch (error) {
        console.error("Error refetching project data:", error);
      } finally {
        setLoading(false);
      }
    };
    reloadData();
  }, [refetch, data]); // Only re-run when refetch or data changes

  const [changeStatus] = useMutation(queries.CHANGE_APPLICATION_STATUS);

  const handleAccept = async (applicationId) => {
    try {
      await changeStatus({
        variables: { id: applicationId, status: "APPROVED" },
      });
      await refetch(); // Refetch data after changing status
    } catch (err) {
      console.error("Error accepting application:", err);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await changeStatus({
        variables: { id: applicationId, status: "REJECTED" },
      });
      await refetch(); // Refetch data after changing status
    } catch (err) {
      console.error("Error rejecting application:", err);
    }
  };

  if (loading) {
    return (
      <div className={`d-card glassEffect transition-fade-in-out fade-in`}>
        <div className="d-card-header">
          <h2>Loading...</h2>
        </div>
        <div className="d-card-body">
          <p>Loading project requests...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.getProjectById) {
    return (
      <div className={`d-card glassEffect transition-fade-in-out fade-in`}>
        <div className="d-card-header">
          <h2>Error</h2>
        </div>
        <div className="d-card-body">
          <p>Error loading requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`d-card glassEffect transition-fade-in-out fade-in`}>
      <div className="d-card-header">
        <h2>Requests</h2>
      </div>
      <div className="d-card-body">
        <div className="col-12">
          {data.getProjectById.applications.length > 0 ? (
            data.getProjectById.applications
              .filter((application) => application.status === "PENDING")
              .map((application) => (
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
              ))
          ) : (
            <p>No applications found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
