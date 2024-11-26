import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($token: String!) {
    login(token: $token) {
      message
      uid
      email
      role
    }
  }
`;
