import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {useQuery} from '@apollo/client';
import queries from '../../queries';
import ActionBar from "../common/ActionBar_2";

function ApplicationDetails(props) {
    /* 
        1. The details page would list the following information about the application:
            a. Project title
            b. Project lead professor
            c. Application date
            d. Application status
            e. Application comments
    */
   /* CLIENT SIDE LOGIC
    const {id} = useParams();
    const applicationData = useQuery(queries.GET_APPLICATION_BY_ID, {
        variables: { id },
        fetchPolicy: 'cache-and-network'
    });
    /* END OF CLIENT SIDE LOGIC */
    const applicationData = {
        data: {
          getApplicationById: {
            _id: "675ba2b9a7087b383bde3992",
            applicant: {
              _id: "67590667d7fc41be5ef64425",
              firstName: "Kushal",
              lastName: "Trivedi"
            },
            project: {
              _id: "675b2aeb0715f0d79465f037",
              title: "AI Research in Finance",
              professors: [
                    {
                        _id: "67590667d7fc41be5ef64425",
                        firstName: "Kushal",
                        lastName: "Trivedi"
                    }
                ]
            },
            applicationDate: "2024-12-13T02:58:01.023Z",
            lastUpdatedDate: "2024-12-13T02:58:01.023Z",
            status: "PENDING",
            numOfComments: 0
          }
        }
      }
    const application = applicationData.data.getApplicationById;
    const loading = applicationData.loading;
    const error = applicationData.error;
    
    if(loading){
        return (
            <p>Loading..</p>
        );
    } else if (error){
        return (
            <p>Error: {error}</p>
        );
    } else {
        return (
            <main className="dashboard">
            <ActionBar />
            <div className="container-fluid my-3">
                <div className="d-card glassEffect">
                    <div className="d-card-header">Application Details</div>
                    <div className="d-card-body">
                        <dl className="desc-list">
                            <div>
                                <dt>Project Title:</dt>
                                <dd>{application.project.title}</dd>
                            </div>
                            <div>
                                <dt>Lead Professor:</dt>
                                <dd>{application.project.professors.firstName} {application.project.professors.lastName}</dd>
                            </div>
                            <div>
                                <dt>Application Date:</dt>
                                <dd>{application.applicationDate}</dd>
                            </div>
                            <div>
                                <dt>Application Status:</dt>
                                <dd>{application.status}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
            </main>
        );
    }

}

export default ApplicationDetails;