import {gql} from '@apollo/client';

/* QUERIES
******************************** */
// Get User By Id
const GET_USER_BY_ID = gql`
    query GetUserById($id: String!) {
        getUserById(_id: $id) {
            _id
            firstName
            lastName
            email
            password
            role
            department
            bio
            applications
            projects
            numOfApplications
            numOfProjects
        }
    }
`;

/* MUTATIONS
******************************** */