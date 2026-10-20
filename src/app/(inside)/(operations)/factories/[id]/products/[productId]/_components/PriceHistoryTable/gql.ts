import { gql } from "@apollo/client";

export const PRODUCT_PRICE_HISTORY_QUERY = gql`
  query ProductPriceHistory($productId: UUID!) {
    productPriceHistory(productId: $productId) {
      id
      changedAt
      unitPrice
      previousUnitPrice
      variationPct
      tierName
      priceListId
      priceListName
      region
      isPriceListActive
    }
  }
`;

export interface PriceChange {
  id: string;
  changedAt: string;
  unitPrice: string;
  previousUnitPrice: string | null;
  variationPct: string | null;
  tierName: string;
  priceListId: string;
  priceListName: string;
  region: string;
  isPriceListActive: boolean;
}

export interface ProductPriceHistoryData {
  productPriceHistory: PriceChange[];
}
