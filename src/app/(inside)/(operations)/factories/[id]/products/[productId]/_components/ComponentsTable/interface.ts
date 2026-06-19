export interface ProductComponentNode {
  __typename?: "ProductComponentType";
  id: string;
  quantity: string;
  updatedAt: string;
  componentProductId: string;
  component: {
    __typename?: "ProductType";
    id: string;
    sku: string;
    name: string;
    unitLabel: { id: string; label: string } | null;
  } | null;
}

export interface ProductComponentsData {
  product_components_detail: {
    status: boolean;
    message: string;
    data: {
      id: string;
      components: ProductComponentNode[];
    } | null;
  };
}

export interface ComponentProductsOptionsData {
  products: {
    edges: { node: { id: string; sku: string; name: string } }[];
  };
}

export interface AddComponentResponse {
  addComponentToProduct: { status: boolean; message: string };
}

export interface UpdateComponentResponse {
  updateProductComponent: { status: boolean; message: string };
}

export interface RemoveComponentResponse {
  removeComponentFromProduct: { status: boolean; message: string };
}
