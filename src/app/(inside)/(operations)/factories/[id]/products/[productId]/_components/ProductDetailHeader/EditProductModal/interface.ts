import { ProductDetail } from "../../../interface";

export interface UpdateProductResponse {
  updateProduct: {
    status: boolean;
    code: number;
    message: string;
    data: ProductDetail | null;
  };
}

export interface ProductCategoriesOptionsData {
  product_categories_options: {
    edges: { node: { id: string; name: string; segment: string } }[];
  };
}

export interface ProductUnitsOptionsData {
  productUnits: {
    edges: { node: { id: string; label: string } }[];
  };
}

export interface ProductUnitLabelsOptionsData {
  productUnitLabels: {
    edges: { node: { id: string; label: string } }[];
  };
}

export interface EditProductModalProps {
  product: ProductDetail;
  onSuccess: () => void;
}
