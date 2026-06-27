import { FactoryProduct } from "../gql";

export interface CreateProductResponse {
  createProduct: {
    __typename?: "ProductTypeDataResponse";
    status: boolean;
    message: string;
    data: FactoryProduct | null;
  };
}
