import { FactoryProduct } from "../gql";

export interface ProductCategoriesData {
  productCategories: {
    edges: { node: { id: string; name: string } }[];
  };
}

export interface ProductUnitsData {
  productUnits: {
    edges: { node: { id: string; label: string } }[];
  };
}

export interface ProductUnitLabelsData {
  productUnitLabels: {
    edges: { node: { id: string; label: string } }[];
  };
}

export interface SelectOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface CreateProductResponse {
  createProduct: {
    __typename?: "ProductTypeDataResponse";
    status: boolean;
    message: string;
    data: FactoryProduct | null;
  };
}

export interface CreateProductUnitResponse {
  createProductUnit: {
    __typename?: "ProductUnitTypeDataResponse";
    status: boolean;
    message: string;
    data: { id: string; label: string } | null;
  };
}

export interface CreateProductUnitLabelResponse {
  createProductUnitLabel: {
    __typename?: "ProductUnitLabelTypeDataResponse";
    status: boolean;
    message: string;
    data: { id: string; label: string } | null;
  };
}
