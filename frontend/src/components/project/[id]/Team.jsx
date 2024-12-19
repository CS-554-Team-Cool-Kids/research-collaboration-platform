import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@apollo/client";
import queries from "../../../queries";

const Team = () => {
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
  const formatDepartment = (department) => {
    return department
      .split("_") // Split by underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "); // Join the words back with spaces
  };

  return (
    <div className="d-card glassEffect transition-fade-in-out fade-in">
      <div className="d-card-header">
        <h2>Members</h2>
      </div>
      <div className="d-card-body">
        <div className="col-12">
          <div className="mb-4">
            <h4 className="fw-bold">Professor</h4>
            {/* Professors */}
            {data?.getProjectById.professors.map((professor) => (
              <div key={professor.email} className="row mt-3">
                <div className="col-4">{`${professor.firstName} ${professor.lastName}`}</div>
                <div className="col-4">{professor.email}</div>
                <div className="col-4">
                  {formatDepartment(professor.department)}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="fw-bold">Student</h4>
            {/* Students */}
            {data?.getProjectById.students.map((student) => (
              <div key={student.email} className="row mt-3">
                <div className="col-4">{`${student.firstName} ${student.lastName}`}</div>
                <div className="col-4">{student.email}</div>
                <div className="col-4">
                  {formatDepartment(student.department)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;