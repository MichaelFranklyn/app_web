export interface ProductFactory {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
}

export interface ProductCompanyFactory {
  id: string;
  factory: ProductFactory | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  segment: string;
}

export interface ProductUnitRef {
  id: string;
  label: string;
}

export interface ProductUnitLabelRef {
  id: string;
  label: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  unitPerPack: string;
  ncm: string | null;
  saleMultiple: string | null;
  isActive: boolean;
  unitId: string;
  unitLabelId: string;
  unit: ProductUnitRef | null;
  unitLabel: ProductUnitLabelRef | null;
  companyFactory: ProductCompanyFactory | null;
  category: ProductCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailResponse {
  product_detail: {
    status: boolean;
    message: string;
    data: ProductDetail | null;
  };
}
