import { gql } from "@apollo/client";

export const COMPANY_FACTORY_DETAIL_QUERY = gql`
  query CompanyFactoryDetail($id: UUID!) {
    company_factory_detail: companyFactory(id: $id) {
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
        specialConditions
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
  }
`;
