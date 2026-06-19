import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      status
      code
      message
      data {
        id
        name
        email
        role
        isActive
        createdAt
        updatedAt
        company {
          id
          nomeFantasia
          razaoSocial
        }
      }
    }
  }
`;
