import React from "react";
import { useParams } from "react-router-dom";
import ActionBar from "./ActionBar_2";
import { useQuery } from "@apollo/client";
import queries from "../../../queries";

const Team = () => {
  const { id: projectId } = useParams(); // Extract projectId from the URL

  const { data, loading, error } = useQuery(queries.GET_PROJECT_BY_ID, {
    variables: { id: projectId },
    fetchPolicy: "network-only",
  });

  if (loading) return <p className="loader">Loading...</p>;
  if (error) return <p className="error-message">Error: {error.message}</p>;

  return (
    <main className="dashboard">
      <ActionBar
        projectId={projectId}
        projectTitle={data.getProjectById.title}
      />
      <div className="container-fluid my-3">
        <div className="d-card glassEffect">
          <div className="d-card-header">
            <h2>Members</h2>
          </div>
          <div className="d-card-body">
            {loading ? (
              <p className="loader">Loading...</p>
            ) : error ? (
              <p>Error loading team members: {error.message}</p>
            ) : (
              <div className="col-12">
                <div className="mb-4">
                  <h4 className="fw-bold">Professor</h4>
                  {/* Professors */}
                  {data.getProjectById.professors.map((professor) => (
                    <div key={professor.email} className="row mt-3">
                      <div className="col-4">{`${professor.firstName} ${professor.lastName}`}</div>
                      <div className="col-4">{professor.email}</div>
                      <div className="col-4">{professor.department}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="fw-bold">Student</h4>
                  {/* Students */}
                  {data.getProjectById.students.map((student) => (
                    <div key={student.email} className="row mt-3">
                      <div className="col-4">{`${student.firstName} ${student.lastName}`}</div>
                      <div className="col-4">{student.email}</div>
                      <div className="col-4">{student.department}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Team;
