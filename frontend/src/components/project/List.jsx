import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import queries from "../../queries.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ProjectList = () => {
  const { authState } = useAuth();

  const userId = authState.user.id;
  const { data, loading, error, refetch } = useQuery(queries.GET_USER_BY_ID, {
    variables: { id: userId },
    fetchPolicy: "network-only",
  });
  console.log("projects data: ", data);

  const [selectedProject, setSelectedProject] = useState(null);

  // Mutation to remove a project
  const [removeProject] = useMutation(queries.REMOVE_PROJECT);

  const handleDelete = async () => {
    if (!selectedProject?._id) return;

    const confirmDeletion = window.confirm(
      `Are you sure you want to delete the project "${selectedProject.title}"?`
    );

    if (confirmDeletion) {
      try {
        await removeProject({ variables: { id: selectedProject._id } });
        await refetch();
      } catch (error) {
        console.error("Deletion failed:", error);
      }
    }
  };

  useEffect(() => {
    if (data) {
      setSelectedProject(null); // Reset selected project when data changes
    }
  }, [data]);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>Error loading projects: {error.message}</p>;

  const projects = data?.getUserById?.projects || [];

  return (
    <main className="dashboard">
      <div className="container my-3">
        <div className="d-card glassEffect">
          <div className="d-card-header">
            <div className="col-12">
              <div className="row">
                <div className="col my-auto">
                  <h2>Project List</h2>
                </div>

                <div className="col-auto d-flex">
                  {selectedProject?._id ? (
                    <div className="d-flex">
                      <Link
                        className="nav-link"
                        to={`/project/${selectedProject._id}`}
                      >
                        <button className="btn btn-info ms-2">Details</button>
                      </Link>
                      <button
                        className="btn btn-danger ms-2"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex">
                      <button className="btn btn-info ms-2 invisible">
                        Details
                      </button>
                      <button className="btn btn-danger ms-2 invisible">
                        Delete
                      </button>
                    </div>
                  )}

                  <Link className="nav-link" to="/project/add">
                    <button className="btn btn-success ms-2">Add</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="d-card-body p-0">
            <div className="row">
              {/* Left Side: Project List */}
              <div className="col-md-4 pe-0">
                <ul className="chat-list">
                  {projects.map((project, index) => (
                    <li
                      key={project._id}
                      onClick={() => setSelectedProject(project)}
                      className={
                        selectedProject?._id === project._id ? "active" : ""
                      }
                    >
                      <span className="chat-list-number">{index + 1}.</span>
                      <p className="chat-list-header">{project.title}</p>
                      <p>{project.department}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right Side: Reading Pane */}
              <div className="col-md-8 my-3 border-start">
                {selectedProject ? (
                  <div>
                    <h2>{selectedProject.title}</h2>
                    <p>{selectedProject.department}</p>
                    <p>{selectedProject.description}</p>
                  </div>
                ) : (
                  <p>Select a project to view its details.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProjectList;
