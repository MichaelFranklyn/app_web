import { gql } from "@apollo/client";

export const USERS_QUERY = gql`
  query Users($input: BaseListInput!) {
    users_list: users(input: $input) {
      edges {
        node {
          id
          name
          email
          role
          isActive
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const ADD_CLIENT_TO_COMPANY_MUTATION = gql`
  mutation AddClientToCompany($input: AddClientToCompanyInput!) {
    addClientToCompany(input: $input) {
      status
      code
      message
      data {
        id
        clientId
      }
    }
  }
`;
