import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import queries from "../../../queries";
import { useNavigate } from "react-router-dom";

const ApplicationEdit = () => {
    const {id} = useParams();
    const [projectId, setProjectId] = useState("");

    const {
        loading: projectLoading,
        error: projectError,
        data: projectData
    } = useQuery(queries.GET_PROJECTS, {
        fetchPolicy: "network-only",
    })

    const [editApplicationMutation] = useMutation(queries.EDIT_APPLICATION);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const {data} = await editApplicationMutation({
                variables: {
                    id: id,
                    projectId: projectId,
                },
            });
            alert("Application successfully edited");
            navigate("/application");
        } catch(error) {
            alert(`Error editing applicaton: ${error.message}`);
        }
    };

    if(projectLoading){
        return (
            <p className="loader">Loading projects...</p>
        );
    }
    if(projectError){
        return(
            <p className="error-message">Error loading projects: {projectError.message}</p>
        );
    }

    return (
        <main>
            <div className="d-card col-12 col-md-6 glassEffect my-4 mx-auto">
                <div className="d-card-header">
                    <h2>Edit Application</h2>
                </div>
                <div className="d-card-body">
                    <form id="editApplicationForm" onSubmit={handleSubmit}>
                        <div className="form-floating mb-3">
                            <select
                                className="form-control"
                                id="project"
                                name="project"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Select Project
                                </option>
                                {projectData?.projects.map((project) => {
                                    return (
                                        <option key={project._id} value={project._id}>
                                            {project.title}
                                        </option>
                                    )
                                })}
                            </select>
                            <label htmlFor="project">Project:</label>
                        </div>
                        <div className="row">
                            <div className="offset-4 col-4 mt-3">
                                <button
                                    className="btn btn-primary col-12 py-2"
                                    type="submit"
                                    id="submit"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );

}

export default ApplicationEdit;