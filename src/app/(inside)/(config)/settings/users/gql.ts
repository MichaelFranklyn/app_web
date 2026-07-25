import { gql } from "@apollo/client";

/**
 * Lista única de pessoas. `seller` vem junto porque vendedor não é outra
 * entidade na tela: é um usuário que também opera em campo — o badge e as
 * colunas de campo saem daqui.
 */
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
          phone
          createdAt
          seller {
            id
            isActive
            region
            factoryCount
            clientCount
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

// KPIs do topo: medem a operação de campo (quantos vendem, quantos acessos).
export const SELLERS_STATS_QUERY = gql`
  query sellersStats {
    sellersStats {
      totalCount
      activeCount
      activeFactoryAccessCount
      inactiveFactoryAccessCount
    }
  }
`;
