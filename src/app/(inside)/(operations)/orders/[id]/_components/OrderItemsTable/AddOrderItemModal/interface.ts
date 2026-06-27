import { OrderItem } from "../../../interface";

export interface CompanyFactoriesData {
  companyFactories: {
    edges: { node: { id: string; factoryId: string } }[];
  };
}

export interface PriceListsData {
  factoryPriceLists: {
    edges: {
      node: {
        id: string;
        name: string;
        isActive: boolean;
        validFrom: string;
        validUntil: string | null;
      };
    }[];
  };
}

export interface PriceListItemsData {
  priceListItems: {
    edges: {
      node: {
        id: string;
        unitPrice: string;
        product: {
          id: string;
          name: string;
          sku: string;
          saleMultiple: string | null;
          unitLabel: { id: string; label: string } | null;
        } | null;
        tier: { id: string; name: string } | null;
      };
    }[];
  };
}

export interface CreateOrderItemResponse {
  createOrderItem: {
    status: boolean;
    message: string;
    data: OrderItem | null;
  };
}
