import { gql } from "@apollo/client";

export const SELLER_FACTORY_ACCESS_LIST_QUERY = gql`
  query SellerFactoryAccessList($input: BaseListInput!) {
    seller_factory_access_list: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          isActive
          createdAt
          sellerCommissionShare
          sellerCommissionBasis
          seller {
            id
            name
            isActive
          }
          factory {
            id
            nomeFantasia
            nickname
            razaoSocial
          }
          grantedByUser {
            id
            name
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

/**
 * A comissão de cada fábrica vinculada, para a prévia do acordo.
 *
 * Ela mora no vínculo empresa×fábrica, não no acesso do vendedor — e é o que
 * transforma "50% da comissão" em "R$ 350 num pedido de R$ 10.000". Catálogo
 * pequeno (o plano limita as fábricas), então vem inteiro.
 */
export const ACCESS_FACTORY_RATES_QUERY = gql`
  query AccessFactoryRates($input: BaseListInput!) {
    access_factory_rates: companyFactories(input: $input) {
      edges {
        node {
          id
          factoryId
          commissionRate
        }
      }
      totalCount
    }
  }
`;
