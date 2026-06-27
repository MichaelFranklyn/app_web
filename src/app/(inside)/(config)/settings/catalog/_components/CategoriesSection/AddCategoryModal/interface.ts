import { ProductCategoryRow } from "../gql";

export interface CreateProductCategoryResponse {
  createProductCategory: {
    __typename?: "ProductCategoryTypeDataResponse";
    status: boolean;
    message: string;
    data: ProductCategoryRow | null;
  };
}
