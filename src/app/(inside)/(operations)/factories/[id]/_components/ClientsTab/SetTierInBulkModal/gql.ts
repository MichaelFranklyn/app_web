import { gql } from "@apollo/client";

// Cidades dos clientes vinculados a esta fábrica, com quantos clientes há em cada uma.
export const FACTORY_CLIENT_CITIES_QUERY = gql`
  query SellerClientFactoryCities($factoryId: UUID!) {
    sellerClientFactoryCities(factoryId: $factoryId) {
      status
      message
      data {
        city
        state
        clients
      }
    }
  }
`;

// Segmentos (ou redes) dos clientes vinculados, com a contagem; `id` nulo é o
// grupo de quem não tem segmento (ou rede).
export const FACTORY_CLIENT_GROUPS_QUERY = gql`
  query SellerClientFactoryGroups($factoryId: UUID!, $by: ClientGroupBy!) {
    sellerClientFactoryGroups(factoryId: $factoryId, by: $by) {
      status
      message
      data {
        id
        name
        clients
      }
    }
  }
`;

export const SET_TIER_IN_BULK_MUTATION = gql`
  mutation SetSellerClientFactoriesPriceTier(
    $input: SetSellerClientFactoriesPriceTierInput!
  ) {
    setSellerClientFactoriesPriceTier(input: $input) {
      status
      message
      data {
        updated
      }
    }
  }
`;

export type ClientGroupBy = "CITY" | "SEGMENT" | "NETWORK";

export interface ClientCity {
  city: string;
  state: string;
  clients: number;
}

export interface ClientGroup {
  id: string | null;
  name: string;
  clients: number;
}

export interface ClientCitiesData {
  sellerClientFactoryCities: {
    status: boolean;
    message: string | null;
    data: ClientCity[];
  };
}

export interface ClientGroupsData {
  sellerClientFactoryGroups: {
    status: boolean;
    message: string | null;
    data: ClientGroup[];
  };
}

export interface SetTierInBulkData {
  setSellerClientFactoriesPriceTier: {
    status: boolean;
    message: string | null;
    data: { updated: number } | null;
  };
}
