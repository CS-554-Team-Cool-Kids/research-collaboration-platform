import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ProjectList = (props) => {
  const projectData = [
    {
      id: 1,
      name: "Project Alpha",
      description: "Details about Project Alpha.",
    },
    {
      id: 2,
      name: "Project Beta",
      description: "Details about Project Beta.",
    },
    {
      id: 3,
      name: "Project Gamma",
      description: "Details about Project Gamma.",
    },
  ];

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    // Load data from props or default project data
    setProjects(props.projects || projectData || []);
  }, [props.projects]);

  return (
    <main className="dashboard">
      <div className="container my-3">
        <div className="d-card glassEffect">
          <div className="d-card-header">
            <div className="row col-12 d-flex">
              <div className="col my-auto">
                <h2>Project List</h2>
              </div>
              <div className="col-auto">
                {selectedProject?.id ? (
                  <Link
                    className="nav-link"
                    to={"/project/details/" + selectedProject?.id}
                  >
                    <div className="btn btn-info">Details</div>
                  </Link>
                ) : (
                  <div className="btn btn-info invisible">Invisible Button</div>
                )}
              </div>
            </div>
          </div>
          <div className="d-card-body p-0">
            <div className="row">
              {/* Left Side: Project List */}
              <div className="col-md-4">
                <ul className="chat-list">
                  {projects.map((project, index) => (
                    <li
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={
                        selectedProject?.id === project.id ? "active" : ""
                      }
                    >
                      <span className="chat-list-number">{index + 1}.</span>
                      <p className="chat-list-header">{project.name}</p>
                      <p>{project.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right Side: Reading Pane */}
              <div className="col-md-8 my-3 border-start">
                {selectedProject ? (
                  <div>
                    <h2>{selectedProject.name}</h2>
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
