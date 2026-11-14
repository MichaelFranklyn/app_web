import type { OrderSheetPackage } from "@/utils/orderSheet";

export interface OrderSheetPackageData {
  orderSheetPackage: OrderSheetPackage;
}

export interface OrderSheetClientSellersData {
  order_sheet_client_sellers: {
    edges: {
      node: { id: string; seller: { id: string; name: string } | null };
    }[];
    totalCount: number;
  };
}

export interface OrderSheetSellersData {
  order_sheet_sellers: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}
