import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ProjectList = (props) => {
  const projectData = [
    {
      id: 1,
      name: "Project Alpha",
      description:
        "A groundbreaking initiative focused on developing next-generation AI algorithms to enhance predictive analytics and decision-making capabilities in real-time applications.",
    },
    {
      id: 2,
      name: "Project Beta",
      description:
        "A comprehensive project aimed at building a scalable, cloud-based platform for managing and analyzing large datasets across multiple industries.",
    },
    {
      id: 3,
      name: "Project Gamma",
      description:
        "An ambitious undertaking to design and implement a decentralized blockchain network for secure and transparent financial transactions.",
    },
    {
      id: 4,
      name: "Project Delta",
      description:
        "A research-focused project exploring sustainable energy solutions through advanced solar panel technologies and innovative storage systems.",
    },
    {
      id: 5,
      name: "Project Epsilon",
      description:
        "An educational platform designed to provide immersive learning experiences using virtual reality and augmented reality technologies.",
    },
    {
      id: 6,
      name: "Project Zeta",
      description:
        "A health-tech initiative to create a wearable device capable of real-time monitoring of vital signs and providing actionable health insights.",
    },
    {
      id: 7,
      name: "Project Eta",
      description:
        "A social good project aimed at building a mobile app that connects volunteers with local community service opportunities efficiently.",
    },
    {
      id: 8,
      name: "Project Theta",
      description:
        "An environmental conservation project focused on developing IoT-enabled devices for monitoring air and water quality in urban areas.",
    },
    {
      id: 9,
      name: "Project Iota",
      description:
        "A transportation project leveraging AI and machine learning to optimize traffic flow and reduce congestion in metropolitan cities.",
    },
    {
      id: 10,
      name: "Project Kappa",
      description:
        "An e-commerce project aimed at creating an AI-powered recommendation engine to provide personalized shopping experiences for users.",
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
            <div className="col-12">
              <div className="row">
                <div className="col my-auto">
                  <h2>Project List</h2>
                </div>

                <div className="col-auto d-flex">
                  {selectedProject?.id ? (
                    <div className="d-flex">
                      <Link
                        className="nav-link"
                        to={"/project/" + selectedProject?.id}
                      >
                        <button className="btn btn-info ms-2">Details</button>
                      </Link>
                      <button className="btn btn-danger ms-2">Delete</button>
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

                  <Link className="nav-link" to={"/project/add"}>
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
