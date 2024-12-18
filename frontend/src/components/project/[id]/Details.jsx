import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import "../../../assets/css/sidebar.css";
import queries from "../../../queries";

const ProjectDetails = () => {
  const { refetch } = useOutletContext(); // Get refetch function from Outlet context
  const [data, setData] = useState();

  useEffect(() => {
    const reloadData = async () => {
      const { data: refetchedData } = await refetch();
      if (refetchedData !== data) {
        // Only update if data has changed
        setData(refetchedData);
      }
    };
    reloadData();
  }, [refetch, data]); // Only re-run when refetch or data changes

  let formattedDate = data?.getProjectById.createdDate;

  if (formattedDate) {
    // Convert to a Date object
    const dateObject = new Date(formattedDate);

    // Format the date in Eastern Time (only date part)
    formattedDate = dateObject.toLocaleDateString("en-US", {
      weekday: "long", // e.g., "Monday"
      year: "numeric", // e.g., "2024"
      month: "long", // e.g., "December"
      day: "numeric", // e.g., "16"
      timeZone: "America/New_York", // Eastern Time
    });
  }

  const formatDepartment = (department) => {
    return department
      .split("_") // Split by underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "); // Join the words back with spaces
  };

  // Usage in your component
  let formattedDepartment = "";
  if (data?.getProjectById) {
    formattedDepartment = formatDepartment(data?.getProjectById.department);
  }

  return (
    <div className="transition-fade-in-out fade-in">
      <div className="row">
        <div className="col-6 col-md-3">
          <div className="d-card glassEffect">
            <div className="d-card-body text-center p-4">
              <div className="text-truncate">
                <span className="fs-4 fw-bold d-block">Department</span>
                <span className="fs-6" title={formattedDepartment}>
                  {formattedDepartment}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="d-card glassEffect">
            <div className="d-card-body text-center p-4">
              <div className="text-truncate">
                <span className="fs-4 fw-bold d-block">Project Initiated</span>
                <span className="fs-6" title={formattedDate}>
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="d-card glassEffect">
            <div className="d-card-body text-center p-4">
              <div className="text-truncate">
                <span className="fs-4 fw-bold">Team Count</span>
                <span
                  className="ms-3 fs-1 fw-light"
                  title={
                    data?.getProjectById.students.length +
                    data?.getProjectById.professors.length
                  }
                >
                  {data?.getProjectById.students.length +
                    data?.getProjectById.professors.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="d-card glassEffect">
            <div className="d-card-body text-center p-4">
              <div>
                <span className="fs-4 fw-bold">Application Count</span>
                <span
                  className="ms-3 fs-1 fw-regular"
                  title={data?.getProjectById.numOfApplications}
                >
                  {data?.getProjectById.numOfApplications}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="d-card glassEffect">
            <div className="d-card-body">
              {data?.getProjectById.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;