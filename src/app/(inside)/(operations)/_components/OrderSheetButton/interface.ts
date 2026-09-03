import type { OrderSheetPackage } from "@/utils/orderSheet";

export interface OrderSheetPackageData {
  orderSheetPackage: OrderSheetPackage;
}

export interface OrderSheetSellersData {
  order_sheet_sellers: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}
