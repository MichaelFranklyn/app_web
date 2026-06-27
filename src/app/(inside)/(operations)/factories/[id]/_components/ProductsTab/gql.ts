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
          isNeedsAttention
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
  isNeedsAttention: boolean;
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

// ─── Infra de formulário de produto compartilhada por Add/Edit/Toggle ─── //

export const PRODUCT_CATEGORIES_QUERY = gql`
  query ProductCategoriesOptions($input: BaseListInput!) {
    productCategories(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const PRODUCT_UNITS_QUERY = gql`
  query ProductUnitsOptions($input: BaseListInput!) {
    productUnits(input: $input) {
      edges {
        node {
          id
          label
        }
      }
    }
  }
`;

export const PRODUCT_UNIT_LABELS_QUERY = gql`
  query ProductUnitLabelsOptions($input: BaseListInput!) {
    productUnitLabels(input: $input) {
      edges {
        node {
          id
          label
        }
      }
    }
  }
`;

export const CREATE_PRODUCT_UNIT_MUTATION = gql`
  mutation CreateProductUnitInline($input: CreateProductUnitInput!) {
    createProductUnit(input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const CREATE_PRODUCT_UNIT_LABEL_MUTATION = gql`
  mutation CreateProductUnitLabelInline($input: CreateProductUnitLabelInput!) {
    createProductUnitLabel(input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: UUID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      status
      message
      data {
        id
        sku
        name
        ncm
        unitPerPack
        isActive
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
  }
`;
