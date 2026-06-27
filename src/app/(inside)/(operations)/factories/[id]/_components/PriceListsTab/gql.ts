import { gql } from "@apollo/client";

export const FACTORY_PRICE_LISTS_QUERY = gql`
  query FactoryPriceLists($input: BaseListInput!) {
    factory_price_lists: factoryPriceLists(input: $input) {
      edges {
        node {
          id
          name
          region
          validFrom
          validUntil
          isActive
          clonedFromId
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

export const PRICE_LISTS_LIST_FIRST = 50;

/** Variáveis canônicas da listagem de tabelas (query + update otimista do cache). */
export const buildFactoryPriceListsVariables = (companyFactoryId: string) => ({
  input: {
    first: PRICE_LISTS_LIST_FIRST,
    filters: [
      { field: "company_factory_id", operator: "eq", value: companyFactoryId },
    ],
  },
});

export interface FactoryPriceListNode {
  __typename?: "FactoryPriceListType";
  id: string;
  name: string;
  region: string;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  clonedFromId: string | null;
}

export interface FactoryPriceListsData {
  factory_price_lists: {
    __typename?: string;
    edges: { __typename?: string; node: FactoryPriceListNode }[];
    pageInfo?: {
      __typename?: string;
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export const UPDATE_FACTORY_PRICE_LIST_MUTATION = gql`
  mutation UpdateFactoryPriceList(
    $id: UUID!
    $input: UpdateFactoryPriceListInput!
  ) {
    updateFactoryPriceList(id: $id, input: $input) {
      status
      message
      data {
        id
        name
        region
        validFrom
        validUntil
        isActive
      }
    }
  }
`;

export const CLONE_FACTORY_PRICE_LIST_MUTATION = gql`
  mutation CloneFactoryPriceList($input: CloneFactoryPriceListInput!) {
    cloneFactoryPriceList(input: $input) {
      status
      message
      data {
        id
        name
        region
        validFrom
        validUntil
        isActive
      }
    }
  }
`;

export const DELETE_FACTORY_PRICE_LIST_MUTATION = gql`
  mutation DeleteFactoryPriceList($id: UUID!) {
    deleteFactoryPriceList(id: $id) {
      status
      message
    }
  }
`;
