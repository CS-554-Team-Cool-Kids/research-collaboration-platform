import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ActionBar from "../../common/ActionBar_2";
import "../../../assets/css/sidebar.css";

const ProjectList = (props) => {
  return (
    <main className="dashboard">
      <ActionBar />
      <div className="container-fluid my-3">
        <div className="d-card glassEffect">
          <div className="d-card-header">Head</div>
          <div className="d-card-body">Body</div>
        </div>
      </div>
    </main>
  );
};

export default ProjectList;
