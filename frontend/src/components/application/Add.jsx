import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import queries from "../../queries";
import { useAuth } from "../../context/AuthContext.jsx";
import { use } from "react";

const AddApplication = () => {
  const { authState } = useAuth();
  const applicantId = authState.user.id;

  const [projectId, setProjectId] = useState("");

  const projectsData = useQuery(queries.GET_PROJECTS, {
    fetchPolicy: "network-only",
  });
  console.log("projectsData: ", projectsData);

  const [addApplicationMutation] = useMutation(queries.ADD_APPLICATION);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addApplicationMutation({
        variables: {
          applicantId: applicantId,
          projectId: projectId,
        },
      });
      console.log("Application added: ", data.addApplication);
      navigate("/application");
    } catch (error) {
      alert(`Error adding application: ${error.message}`);
    }
  };
  if (projectsData.loading) return <p className="loader">Loading projects...</p>;
  if (projectsData.error)
    return <p>Error loading projects: {projectsData.error.message}</p>;
  return (
    <div className="d-card col-12 col-md-6 glassEffect my-4 mx-auto">
      <div className="d-card-header">
        <h2>Add New Application</h2>
      </div>
      <div className="d-card-body">
        <form id="addApplicationForm" onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <select
              className="form-control"
              type="text"
              id="project"
              name="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Project
              </option>
              {projectsData?.data?.projects.map((project) => {
                return (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                );
              })}
            </select>
            <label htmlFor="department">Project:</label>
          </div>
          <div className="row">
            <div className="offset-4 col-4 mt-3">
              <button
                className="btn btn-primary col-12 py-2"
                type="submit"
                id="submit"
              >
                Submit Application
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplication;
