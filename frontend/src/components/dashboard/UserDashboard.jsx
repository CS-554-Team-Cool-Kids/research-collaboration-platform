import React, {useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import {useQuery, useLazyQuery} from '@apollo/client'; 
import queries from '../../queries';
import ActionBar from '../common/ActionBar';
import EditUser from '../modals/EditUser';

function UserDashboard(props){
    const {id} = useParams();

    /*const userData = useQuery(queries.GET_USER_BY_ID, {
        variables: { id },
        fetchPolicy: 'cache-and-network'
    });
    const user = userData.data.user;
    
    const projectData = useQuery(queries.GET_PROJECTS, {
        fetchPolicy: 'cache-and-network'
    });
    const projects = projectData.data.projects;

    const updateData = useQuery(queries.GET_UPDATES, {
        fetchPolicy: 'cache-and-network'
    });
    const updates = applicationDdata.data.updates;
    */

    /* Temporary Code - Delete after testing */
    const loading = false;
    const error = false;
    const userData={
        user: {
            _id: "00001",
            firstName: "John",
            lastName: "Doe", 
            email: "johndoe@email.com",
            password: "password123", 
            role: "PROFESSOR",
            department: "COMPUTER_SCIENCE",
            bio: "",
            applications: [
                {
                    _id:"0001",
                    applicantId: "00001",
                    projectId: "001",
                    applicationDate:"01/30/2024",
                    lastUpdatedDate:"10/12/2024",
                    status: "PENDING",
                    comments: []
                },
                {
                    _id:"0002",
                    applicantId: "00001",
                    projectId: "002",
                    applicationDate:"11/02/2024",
                    lastUpdatedDate:"11/20/2024",
                    status: "WAITLISTED",
                    comments: []
                }
            ],
            projects: [
                {
                    _id: "003",
                    title: "Project A",
                    createdDate: "02/19/2024",
                    department: "",
                    professors: [
                        {
                            _id: "1001",
                            firstName:"Jaida",
                            lastName: "Kitchens",
                        },
                        {
                            _id: "1002",
                            firstName: "Murphy",
                            lastName: "Cullen"
                        },
                        {
                            _id: "1003",
                            firstName: "Kenneth",
                            lastName: "Oliverson"
                        }
                    ],
                    students: [
                        {
                            _id: "2001",
                            firstName: "Esme",
                            lastName: "Adkins"
                        },
                        {
                            _id: "2002",
                            firstName: "Gabriel",
                            lastName: "Smith"
                        }
                    ],
                    applications: [],
                    numOfApplications: 12,
                    numOfUpdates: 113
                },
                {
                    _id: "004",
                    title: "Project B",
                    createdDate: "02/19/2024",
                    department: "",
                    professors: [
                        {
                            _id: "1005",
                            firstName:"Hanna",
                            lastName: "Baines",
                        },
                        {
                            _id: "1006",
                            firstName: "Charles",
                            lastName: "Rider"
                        },
                        {
                            _id: "1007",
                            firstName: "Eric",
                            lastName: "Scott"
                        }
                    ],
                    students: [
                        {
                            _id: "2001",
                            firstName: "Michael",
                            lastName: "Ryley"
                        },
                        {
                            _id: "2002",
                            firstName: "Aaron",
                            lastName: "Salmon"
                        }
                    ],
                    applications: [
                        {
                            _id:"3001",
                            applicantId: "00001",
                            subject: "ApplicationA Subject",
                            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                            projectId: "010",
                            postedDate: "08/13/2024",
                            comments: [],
                            numOfComments: 0
                        },
                        {
                            _id:"3002",
                            applicantId: "00001",
                            subject: "ApplicationB Subject",
                            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                            projectId: "011",
                            postedDate: "09/10/2024",
                            comments: [],
                            numOfComments: 0
                        },
                        {
                            _id:"3003",
                            applicantId: "00001",
                            subject: "ApplicationB Subject",
                            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                            projectId: "012",
                            postedDate: "10/22/2024",
                            comments: [],
                            numOfComments: 0
                        }
                    ],
                    numOfApplications: 10,
                    numOfUpdates: 100
                }
            ],
            numOfApplications: 2,
            numOfProjects: 1
        }
    }
    const updatesData = {
        updates: [
            {
                _id: "8001",
                posterId: "1001",
                subject: "Update One",
                content: "Update One: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                projectId: "003",
                postedDate: "11/29/2024",
                comments: [
                    {
                        _id: "9001", 
                        comment: "Comment A: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        commentDate: "11/20/2024",
                        commentor: "Jaida Kitchen"
                    },
                    {
                        _id: "9002", 
                        comment: "Comment B: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        commentDate: "11/08/2024",
                        commentor: "Esme Adkins"
                    }
                ],
                numOfComments: 2
            },
            {
                _id: "8002",
                posterId: "5002",
                subject: "Update Two",
                content: "Update Two: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                projectId: "004",
                postedDate: "11/10/2024",
                comments: [
                    {
                        _id: "9001", 
                        comment: "Comment A: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        commentDate: "11/20/2024",
                        commentor: "Jaida Kitchen"
                    }
                ],
                numOfComments: 1
            },
            {
                _id: "8003",
                posterId: "5003",
                subject: "Update Three",
                content: "Update Three: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                projectId: "004",
                postedDate: "11/19/2024",
                comments: [
                    {
                        _id: "9001", 
                        comment: "Comment A: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        commentDate: "11/20/2024",
                        commentor: "Jaida Kitchen"
                    },
                    {
                        _id: "9002", 
                        comment: "Comment B: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        commentDate: "11/08/2024",
                        commentor: "Esme Adkins"
                    },
                    {
                        _id: "9003", 
                        comment: "Comment B: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        commentDate: "11/08/2024",
                        commentor: "Esme Adkins"
                    }
                ],
                numOfComments: 3
            }
        ]
    }

    const {user} = userData;
    const {updates} = updatesData;
    /* End of Temporary Code*/

    if(user){
        return(
            <main className="dashboard">
                <ActionBar role={user.role}/>
                <div className="main-content">
                    <h1>Welcome {user.firstName} {user.lastName}</h1>
                    <div className="dashboard-table">
                        {/* MAIN CARDS (Column) */}
                        <div className="d-column">

                            {/* PROJECTS CARD */}
                            <div className="d-card">
                                <div className="d-card-header">
                                    <h2>Project List</h2>
                                </div>
                                <div className="d-card-body">
                                    <table className="d-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Professors</th>
                                                <th>Students</th>
                                                <th>Creation Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.projects && user.projects.map((project) => {
                                                return(
                                                    <tr key={project._id}>
                                                        <td>{project.title}</td>
                                                        <td>{project.professors.length}</td>
                                                        <td>{project.students.length}</td>
                                                        <td>{project.createdDate}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* APPLICATIONS CARD */}
                            <div className="d-card">
                                <div className="d-card-header">
                                    <h2>Applications List</h2>
                                </div>
                                <div className="d-card-body">
                                    <table className="d-table">
                                        <thead>
                                            <tr>
                                                <th>Project Name</th>
                                                <th>Creation Date</th>
                                                <th>Last Application Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.applications && user.applications.map( (application) => {
                                                return (
                                                    <tr key={application._id}>
                                                        <td>Project Name Pending...</td>
                                                        <td>{application.applicationDate}</td>
                                                        <td>{application.lastUpdatedDate}</td>
                                                        <td>{application.status}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* SIDE CARDS */}
                        <div className="d-column">

                            {/* USER INFORMATION */}
                            <div className="d-card">
                                <div className="d-card-header">
                                    <h2>User Information</h2>
                                    <Link className="card-header-link" to="/edituser/">
                                        Edit
                                    </Link>
                                </div>
                                <div className="d-card-body">
                                    <dl className="desc-list">
                                        <div>
                                            <dt>Name:</dt>
                                            <dd>{user.firstName} {user.lastName}</dd>
                                        </div>
                                        <div>
                                            <dt>Email:</dt>
                                            <dd>{user.email}</dd>
                                        </div>
                                        <div>
                                            <dt>Role:</dt>
                                            <dd>{user.role}</dd>
                                        </div>
                                        <div>
                                            <dt>Department: </dt>
                                            <dd>{user.department}</dd>
                                        </div>
                                        <div>
                                            <dt>Applications:</dt>
                                            <dd>{user.numOfApplications}</dd>
                                        </div>
                                        <div>
                                            <dt>Projects:</dt>
                                            <dd>{user.numOfProjects}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* NEWS FEED CARD */}
                            <div className="d-card">
                                <div className="d-card-header">
                                    <h2>News Feed</h2>
                                    <Link className="card-header-link" to="/newsfeed/">View All</Link>
                                </div>
                                <div className="d-card-body">
                                    <ul className="news-list">
                                        {updates && updates.map( (update) => {
                                            return(
                                                <li key={update._id}>
                                                    <div className="news-text">
                                                        <p className="news-list-header">{update.subject}</p>
                                                        <p>{update.content}</p>
                                                    </div>
                                                    <p>{update.postedDate}</p>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>

                            {/* CHAT CARD */}
                            <div className="d-card">
                                <div className="d-card-header">
                                    <h2>Chat (pending...)</h2>
                                    <Link className="card-header-link" to="/chat/">View All</Link>
                                </div>
                                <div className="d-card-body">
                                    <ul className="chat-list">
                                        <li>
                                            <p className="chat-list-header">Chat Poster Name</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                        </li>
                                        <li>
                                            <p className="chat-list-header">Chat Poster Name</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                        </li>
                                        <li>
                                            <p className="chat-list-header">Chat Poster Name</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                        </li>
                                        <li>
                                            <p className="chat-list-header">Chat Poster Name</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                        </li>
                                        <li>
                                            <p className="chat-list-header">Chat Poster Name</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                        </li>
                                        <li>
                                            <p className="chat-list-header">Chat Poster Name</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                        </li>
                                        <li>
                                            <p className="chat-list-header">Chat Poster Name</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </main>
        );
    } else if(loading){
        return <p>Loading...</p>
    } else if (error){
        return <p>{error.message}</p>
    }
}

export default UserDashboard;