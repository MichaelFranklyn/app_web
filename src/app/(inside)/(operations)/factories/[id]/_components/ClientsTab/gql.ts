import { gql } from "@apollo/client";

export const FACTORY_CLIENT_LINKS_QUERY = gql`
  query FactoryClientLinks($input: BaseListInput!) {
    factory_client_links: sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          priority
          priceTierId
          client {
            id
            razaoSocial
            nomeFantasia
          }
          seller {
            id
            name
          }
          priceTier {
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

export interface FactoryClientLink {
  id: string;
  priority: string | null;
  priceTierId: string | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  seller: { id: string; name: string } | null;
  priceTier: { id: string; name: string } | null;
}

export interface FactoryClientLinksData {
  factory_client_links: {
    edges: { node: FactoryClientLink }[];
    totalCount: number;
  };
}
