import { gql } from "@apollo/client";

export const UPDATE_COMPANY_CLIENT_MUTATION = gql`
  mutation UpdateCompanyClient($id: UUID!, $input: UpdateCompanyClientInput!) {
    updateCompanyClient(id: $id, input: $input) {
      status
      message
      data {
        id
        isActive
      }
    }
  }
`;
