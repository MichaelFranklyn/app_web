import { gql } from "@apollo/client";

export const COMPANY_FACTORIES_QUERY = gql`
  query CompanyFactories($input: BaseListInput!) {
    company_factories_list: companyFactories(input: $input) {
      edges {
        node {
          id
          commissionRate
          commissionCalcBasis
          paymentTermDays
          contractStart
          contractEnd
          factory {
            id
            cnpj
            razaoSocial
            nomeFantasia
            addressCity
            addressState
            deletedAt
          }
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
