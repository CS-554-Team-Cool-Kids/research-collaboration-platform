import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import queries from "../../../queries";
import ActionBar from "../../project/[id]/ActionBar_2";
import { useAuth } from "../../../context/AuthContext";

const ApplicationDetails = () => {
  /* 
        1. The details page would list the following information about the application:
            a. Project title
            b. Project lead professor
            c. Application date
            d. Application status
            e. Application comments
    */
  const { id } = useParams();
  const { data, loading, error } = useQuery(queries.GET_APPLICATION_BY_ID, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  // Modify Date
  const formatDate = (date) => {
    let newDate = new Date(date);
    const formattedDate = newDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formattedDate;
  };

  if (loading) {
    return <p className="loader">Loading...</p>;
  }
  if (error) {
    return <p>Error: {error.message}</p>;
  }
  const application = data?.getApplicationById || [];
  return (
    <main className="dashboard">
      <ActionBar />
      <div className="container-fluid my-3">
        <div className="d-card glassEffect">
          <div className="d-card-header">Application Details</div>
          <div className="d-card-body">
            <dl className="desc-list">
              <div>
                <dt>Project Title:</dt>
                <dd>{application.project.title}</dd>
              </div>
              <div>
                <dt>Professor:</dt>
                <dd>
                  {application.project.professors[0].firstName}{" "}
                  {application.project.professors[0].lastName}
                </dd>
              </div>
              <div>
                <dt>Application Date:</dt>
                <dd>{formatDate(application.applicationDate)}</dd>
              </div>
              <div>
                <dt>Application Status:</dt>
                <dd>{application.status}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ApplicationDetails;
