import { gql } from "@apollo/client";

export const UPDATE_COMPANY_FACTORY_MUTATION = gql`
  mutation UpdateCompanyFactory($id: UUID!, $input: UpdateCompanyFactoryInput!) {
    updateCompanyFactory(id: $id, input: $input) {
      status
      message
      data {
        id
        commissionRate
        commissionCalcBasis
        paymentTermDays
        territory
        contractStart
        contractEnd
      }
    }
  }
`;
