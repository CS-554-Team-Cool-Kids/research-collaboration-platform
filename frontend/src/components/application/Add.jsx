import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import queries from "../../queries";
import { useAuth } from "../../context/AuthContext.jsx";

const AddApplication = () => {
    const {authState} = useAuth();
    const applicantId = authState.user.id;

    const[project, setProject] = useState("");

    const projects = useQuery(queries.GET_PROJECTS);

    const [addApplicationMutation] = useMutation(queries.ADD_APPLICATION);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); 

        try {
            const {data} = await addApplicationMutation({
                variables: {
                    applicantId
                },
            });
            console.log("Application added: ", data.addApplication);
            navigate("/application");
        } catch(error) {
            alert(`Error adding application: ${error.message}`);
        }
    };
    if(projects.loading) return <p>Loading projects...</p>;
    if(projects.error) return <p>Error loading projects: {projects.error.message}</p>;
    return (
        <div className="d-card col-12 col-md-6 glassEffect my-4 mx-auto">
            <div className="d-card-header">
                <h2>Add New Application</h2>
            </div>
            <div className="d-card-body">
                <form id='addApplicationForm' onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <select 
                            className="form-control"
                            type="text"
                            id="project"
                            name="project"
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Project</option>
                            <option value="testValue">Test Value</option>
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
}

export default AddApplication;