import React, {useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import {useQuery} from '@apollo/client'; 
import queries from '../../queries';
import ActionBar from '../common/ActionBar';
import EditUser from '../modals/EditUser';
import { useAuth } from "../../context/AuthContext.jsx";

const UserDashboard = () => {
    const { authState } = useAuth();
    const id = authState.user.id;

    const userData = useQuery(queries.GET_USER_BY_ID, {
        variables: { id: id },
        fetchPolicy: 'network-only'
    });
    console.log("userData: ", userData);
    const user = userData.data.getuserById;
    const loading = userData.loading;
    const error = userData.error;

    const updateData = useQuery(queries.GET_UPDATES, {
        fetchPolicy: 'network-only'
    });
    const updates = updateData.data.updates;

    if(loading){ return <p>Loading...</p>}
    if(error){ return <p>Error loading user information: {error.message}</p>}
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
                                        {user.applications && user.applications.slice(0,10).map( (application) => {
                                            return (
                                                <tr key={application._id}>
                                                    <td>{application.project.title}</td>
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
                                    {updates && updates.slice(0,10).map( (update) => {
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

                        {/* CHAT CARD 
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
                        */}

                    </div>
                </div>
            </div>
        </main>
    );
}

export default UserDashboard;