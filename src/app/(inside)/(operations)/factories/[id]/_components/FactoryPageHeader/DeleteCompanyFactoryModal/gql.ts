import { gql } from "@apollo/client";

export const DELETE_COMPANY_FACTORY_MUTATION = gql`
  mutation DeleteCompanyFactory($id: UUID!) {
    deleteCompanyFactory(id: $id) {
      status
      message
    }
  }
`;
