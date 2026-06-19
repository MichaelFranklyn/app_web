import { gql } from "@apollo/client";

export const FACTORY_PRODUCTS_QUERY = gql`
  query FactoryProducts($input: BaseListInput!) {
    factory_products: products(input: $input) {
      edges {
        node {
          id
          sku
          name
          ncm
          unitPerPack
          isActive
          needsAttention
          attentionReason
          unitId
          unitLabelId
          unit {
            id
            label
          }
          unitLabel {
            id
            label
          }
          category {
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

export interface FactoryProduct {
  __typename?: "ProductType";
  id: string;
  sku: string;
  name: string;
  ncm: string | null;
  unitPerPack: number;
  isActive: boolean;
  needsAttention: boolean;
  attentionReason: string | null;
  unitId: string;
  unitLabelId: string;
  unit: {
    __typename?: "ProductUnitType";
    id: string;
    label: string;
  } | null;
  unitLabel: {
    __typename?: "ProductUnitLabelType";
    id: string;
    label: string;
  } | null;
  category: {
    __typename?: "ProductCategoryType";
    id: string;
    name: string;
  } | null;
}

export interface FactoryProductsData {
  factory_products: {
    __typename?: string;
    edges: { __typename?: string; node: FactoryProduct }[];
    pageInfo?: {
      __typename?: string;
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}
