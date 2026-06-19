import { gql } from "@apollo/client";

export const LINK_FACTORY_MUTATION = gql`
  mutation LinkFactory($input: LinkFactoryInput!) {
    linkFactory(input: $input) {
      status
      message
      data {
        id
        companyId
        factoryId
        commissionRate
        commissionCalcBasis
        paymentTermDays
        territory
        contractStart
        contractEnd
        createdAt
        updatedAt
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
