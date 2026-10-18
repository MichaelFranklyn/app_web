export interface PurchasePrice {
  orderId: string;
  orderDate: string;
  unitPrice: string;
  /** Por unidade, depois do desconto do item — o que o cliente lembra. */
  netUnitPrice: string;
  units: string;
  isPromo: boolean;
  tierName: string | null;
}

export interface ClientProductPurchasePricesData {
  clientProductPurchasePrices: {
    productId: string;
    purchases: PurchasePrice[];
  }[];
}
