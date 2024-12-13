import React, {useState} from 'react';
import {useParams} from 'react-route-dom';
import {useQuery} from '@apollo/client';
import queries from '../../queries';

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
        fetchPolicy: 'cache-and-network'
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
                                <dt>Project Title</dt>
                                <dd>{application.project.title}</dd>
                            </div>
                            <div>
                                <dt>Lead Professor</dt>
                                <dd>{application.project.professor.firstName} {application.project.professor.lastName}</dd>
                            </div>
                            <div>
                                <dt>Application Date</dt>
                                <dd>{application.applicationDate}</dd>
                            </div>
                            <div>
                                <dt>Application Status</dt>
                                <dd>{application.applicationStatus}</dd>
                            </div>
                        </dl>
                        {/* Add comments */}
                    </div>
                </div>
            </div>
            </main>
        );
    }

}

export default ApplicationDetails;