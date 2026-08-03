import { gql } from "@apollo/client";

// A rede e as lojas dela numa única ida ao servidor. As lojas vêm da carteira
// (`clients`) filtrada por `network_id` — o mesmo recorte do filtro da lista,
// então os dois lugares contam a mesma coisa.
export const CLIENT_NETWORK_QUERY = gql`
  query ClientNetworkDetail($id: UUID!) {
    clientNetwork(id: $id) {
      status
      message
      data {
        id
        name
        notes
        isActive
        storeCount
        invoicedAmount
        lastOrderDate
      }
    }
  }
`;

export const NETWORK_STORES_QUERY = gql`
  query ClientNetworkStores($input: BaseListInput!) {
    network_stores: clients(input: $input) {
      edges {
        node {
          id
          cnpj
          razaoSocial
          nomeFantasia
          addressCity
          addressState
          companyClient {
            id
            lastOrderDate
            segment {
              id
              name
            }
            sellers {
              id
              name
            }
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
