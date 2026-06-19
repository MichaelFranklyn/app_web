import { gql } from "@apollo/client";

export const DELETE_COMPANY_CLIENT_MUTATION = gql`
  mutation DeleteCompanyClient($id: UUID!) {
    deleteCompanyClient(id: $id) {
      status
      message
    }
  }
`;
