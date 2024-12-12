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
    {/* 
    const id = props.userId;

    const applicationData = useQuery(queries.GET_USER_BY_ID, {
        variables: { id },
        fetchPolicy: 'cache-and-network'
    });
    const applicationsList = applicationData.data.getUserById.applications;
    */}
    const applicationsList = [
        {
            _id: "001",
            project: {
                _id:"1001",
                title: "Project Alpha"
            },
            applicationDate: "12/01/2024",
            lastUpdatedDdate: "12/08/2024",
            status: "PENDING",
            comments: [
                {
                    _id:"2001",
                    commenter: {
                        _id: "002",
                        firstName: "John",
                        lastName: "Doe",
                    },
                    content: "Lorem ipsum...",
                    postedDate: "12/02/2024"
                },
                {
                    _id:"2002",
                    commenter: {
                        _id: "001",
                        firstName: "Lisa",
                        lastName: "Frank",
                    },
                    content: "Lorem ipsum...",
                    postedDate: "12/03/2024"
                }
            ],
            numOfComments: 2
        },
        {
            _id: "002",
            project: {
                _id:"1002",
                title: "Project Gamma"
            },
            applicationDate: "10/21/2024",
            lastUpdatedDdate: "12/01/2024",
            status: "WITHDRAWN",
            comments: [
                {
                    _id:"2001",
                    commenter: {
                        _id: "002",
                        firstName: "John",
                        lastName: "Doe",
                    },
                    content: "Lorem ipsum...",
                    postedDate: "12/02/2024"
                },
                {
                    _id:"2002",
                    commenter: {
                        _id: "001",
                        firstName: "Lisa",
                        lastName: "Frank",
                    },
                    content: "Lorem ipsum...",
                    postedDate: "12/03/2024"
                }
            ],
            numOfComments: 2
        }
    ]
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);

    useEffect( () => {
        // Load data from props or default application data
        setApplications(props.applications || applicationsList || []);
    }, [props.applications]);

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

export default ApplicationList;