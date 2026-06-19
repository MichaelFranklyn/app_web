import { gql } from "@apollo/client";

export const PRICE_TIERS_QUERY = gql`
  query PriceTiers($input: BaseListInput!) {
    price_tiers: priceTiers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const TIERS_LIST_FIRST = 50;

/** Variáveis canônicas da listagem de níveis (query + update otimista do cache). */
export const buildPriceTiersVariables = (companyFactoryId: string) => ({
  input: {
    first: TIERS_LIST_FIRST,
    filters: [
      { field: "company_factory_id", operator: "eq", value: companyFactoryId },
    ],
  },
});

export const priceTiersRefetchQueries = (companyFactoryId: string) => [
  {
    query: PRICE_TIERS_QUERY,
    variables: buildPriceTiersVariables(companyFactoryId),
  },
];

export interface PriceTiersData {
  price_tiers: {
    __typename?: string;
    edges: {
      __typename?: string;
      node: { __typename?: string; id: string; name: string };
    }[];
    totalCount: number;
  };
}

export const CREATE_PRICE_TIER_MUTATION = gql`
  mutation CreatePriceTier($input: CreatePriceTierInput!) {
    createPriceTier(input: $input) {
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const UPDATE_PRICE_TIER_MUTATION = gql`
  mutation UpdatePriceTier($id: UUID!, $input: UpdatePriceTierInput!) {
    updatePriceTier(id: $id, input: $input) {
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const DELETE_PRICE_TIER_MUTATION = gql`
  mutation DeletePriceTier($id: UUID!) {
    deletePriceTier(id: $id) {
      status
      message
    }
  }
`;
