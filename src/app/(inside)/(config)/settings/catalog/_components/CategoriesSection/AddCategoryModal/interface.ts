export interface ProductCategoryRow {
  __typename?: "ProductCategoryType";
  id: string;
  name: string;
  segment: string;
}

export interface CreateProductCategoryResponse {
  createProductCategory: {
    __typename?: "ProductCategoryTypeDataResponse";
    status: boolean;
    message: string;
    data: ProductCategoryRow | null;
  };
}
