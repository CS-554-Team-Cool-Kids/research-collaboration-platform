import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useMutation, useQuery} from '@apollo/client';
import queries from '../../../queries';
import ActionBar from "../../common/ActionBar_2";

function ApplicationDetails(props) {
    /* 
        1. The details page would list the following information about the application:
            a. Project title
            b. Project lead professor
            c. Application date
            d. Application status
            e. Application comments
    */
   
    const {id} = useParams();
    const applicationData = useQuery(queries.GET_APPLICATION_BY_ID, {
        variables: { id },
        fetchPolicy: 'network-only'
    });
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