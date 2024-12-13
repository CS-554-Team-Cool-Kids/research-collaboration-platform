import React, {useState, useEffect} from 'react';
import {useQuery} from '@apollo/client';
import queries from '../../queries';
import { Link } from 'react-router-dom';

function ApplicationList(props) {
    /* 
        Note: The props will be passing one of two things: user id (either professor or student) or the array of applications that will be displayed. Need to investigate and confirm the instances in which either would be passed.

        This component will display:
        1. List of applications associated with user
            a. Student: List of applications student applied to
            b. Professor: List of applications associated to professor
        2. The list would consist of the following:
            a. project name
            b. application status
            c. button to view the details, which would redirect to the application/detail page.
            Note: the queries file was updated to ensure the necessary pieces of data are passed.
    */
   
    /*Client Side Logic:

    const id = props.userId;
    //const id = "67590667d7fc41be5ef64425";
    const {loading, error, data} = useQuery(queries.GET_USER_BY_ID, {
        variables: { id },
        fetchPolicy: 'network-only'
    });
    /* End of Client Side Logic */
    
    /* Temporary (Dummy) Data */
    const data = {
        getUserById: {
            _id: "67590667d7fc41be5ef64425",
            firstName: "Kushal",
            lastName: "Trivedi",
            applications: [
                {
                    _id: "675ba2b9a7087b383bde3992",
                    applicant: {
                    _id: "67590667d7fc41be5ef64425",
                    firstName: "Kushal",
                    lastName: "Trivedi"
                    },
                    project: {
                    _id: "675b2aeb0715f0d79465f037",
                    title: "AI Research in Finance"
                    },
                    applicationDate: "2024-12-13T02:58:01.023Z",
                    lastUpdatedDate: "2024-12-13T02:58:01.023Z",
                    status: "PENDING",
                    numOfComments: 0
                },
                {
                    _id: "675ba2d6a7087b383bde3993",
                    applicant: {
                    _id: "67590667d7fc41be5ef64425",
                    firstName: "Kushal",
                    lastName: "Trivedi"
                    },
                    project: {
                    _id: "675b2aeb0715f0d79465f037",
                    title: "AI Research in Finance"
                    },
                    applicationDate: "2024-12-13T02:58:30.935Z",
                    lastUpdatedDate: "2024-12-13T02:58:30.935Z",
                    status: "PENDING",
                    numOfComments: 0
                }
            ],
            email: "ktrivedi1@gmail.com",
            role: "STUDENT",
            department: "COMPUTER_SCIENCE",
            bio: null,
            numOfApplications: 0,
            numOfProjects: 0,
            projects: []
        }
    };
    const loading = false;
    const error = false;
    /* End of Temporary Data */

    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);

    useEffect( () => {
        // Load data from props or default application data
        //setApplications(props.applications || data.getUserById.applications || []);
        setApplications(props.applications || data.getUserById.applications || []);
    }, [props.applications]);

    if(loading){
        return (
            <p>Loading...</p>
        );
    } else if (error){
        return (
            <p>Error: {error}</p>
        );
    } else {
        return (
            <main className="dashboard">
                <div className="container my-3">
                    <div className="d-card glassEffect">
                        <div className="d-card-header">
                            <div className="row col-12 d-flex">
                                <div className="col my-auto">
                                    <h2>Application List</h2>
                                </div>
                                <div className="col-auto">
                                    {selectedApplication?._id ? (
                                        <Link
                                            className="nav-link"
                                            to={"/application/details/" + selectedApplication?._id}
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
                                {/* Left Side: Application List */}
                                <div className="col-md-4">
                                    <ul className="chat-list">
                                        {applications.map((application, index) => (
                                            <li 
                                                key={application._id}
                                                onClick={() => setSelectedApplication(application)}
                                                className={
                                                    selectedApplication?._id === application._id ? "active" : ""
                                                }
                                            >
                                                <span className="chat-list-number">{index + 1}.</span>
                                                <p className="chat-list-header">application.project.title</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Right Side: Reading Pane */}
                                <div className="col-md-8 my-3 border-start">
                                    {selectedApplication ? (
                                        <div>
                                            <h2>{selectedApplication.project.title}</h2>
                                            <p>{selectedApplication.status}</p>
                                        </div>
                                    ) : (
                                        <p>Select an application to view its status</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }
}

export default ApplicationList;