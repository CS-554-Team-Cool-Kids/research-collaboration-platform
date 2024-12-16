import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActionBar from "./ActionBar_2";
import "../../../assets/css/sidebar.css";

const Requests = () => {
  const { id: projectId } = useParams(); // Extract projectId from the URL
  return (
    <main className="dashboard">
      <ActionBar projectId={projectId} />
      <div className="container-fluid my-3">
        <div className="d-card glassEffect">
          <div className="d-card-header">
            <h2>Requests</h2>
          </div>
          <div className="d-card-body">
            <div className="col-12">
              <div className="row">
                <div className="col my-auto">Student Name</div>
                <div className="col-auto">
                  <button className="btn btn-success mx-2">Accept</button>
                  <button className="btn btn-danger mx-2">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Requests;
