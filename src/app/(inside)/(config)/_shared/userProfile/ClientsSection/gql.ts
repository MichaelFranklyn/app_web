import { gql } from "@apollo/client";

export const SELLER_CLIENTS_QUERY = gql`
  query SellerClientLinks($input: BaseListInput!) {
    seller_clients: sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          priority
          visitFrequencyDays
          lastVisitDate
          createdAt
          client {
            id
            razaoSocial
            nomeFantasia
          }
          factory {
            id
            nomeFantasia
            nickname
            razaoSocial
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

/** Um vínculo cliente × fábrica da carteira, como a tabela o lê. */
export interface ClientNode {
  id: string;
  priority: string | null;
  visitFrequencyDays: number | null;
  lastVisitDate: string | null;
  createdAt: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

export interface SellerClientsData {
  seller_clients: {
    edges: { node: ClientNode }[];
    totalCount: number;
  };
}
