import React, {useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import {useQuery} from '@apollo/client'; 
import queries from '../queries';
import ActionBar from './ActionBar';

function UserDashboard(props){
    const {id} = useParams();

    /*const {loading, error, data} = useQuery(queries.GET_USER_BY_ID, {
        variables: { id },
        fetchPolicy: 'cache-and-network'
    });*/
    const loading = false;
    const error = false;
    const data={
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

    if(data){
        const user = data.user;
        return(
            <main className="dashboard">
                <ActionBar role={user.role}/>
                <div class="dashboard-table">
                    {/* Main Cards */}
                    <div className="d-column">
                        <div className="d-card lg">
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
                                                <tr>
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
                    </div>

                    {/* Side Cards */}
                    <div className="d-column">
                        <div className="d-card sm">
                            <div className="d-card-header"></div>
                            <div className="d-card-body"></div>
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