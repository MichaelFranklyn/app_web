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

export const SET_TIER_BY_CITY_MUTATION = gql`
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

export interface ClientCity {
  city: string;
  state: string;
  clients: number;
}

export interface ClientCitiesData {
  sellerClientFactoryCities: {
    status: boolean;
    message: string | null;
    data: ClientCity[];
  };
}

export interface SetTierByCityData {
  setSellerClientFactoriesPriceTier: {
    status: boolean;
    message: string | null;
    data: { updated: number } | null;
  };
}
