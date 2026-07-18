export interface PromotionItemNode {
  id: string;
  unitPrice: string;
  promoPrice: string | null;
  product: {
    id: string;
    name: string;
    sku: string | null;
    unitPerPack: string;
  } | null;
  tier: { id: string; name: string } | null;
}

export interface PromotionItemsData {
  priceListItems: {
    edges: { node: PromotionItemNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

/** Um produto agrupado, com suas linhas de nível (o preço promo é por nível). */
export interface PromotionProduct {
  id: string;
  name: string;
  sku: string | null;
  items: PromotionItemNode[];
}

interface PromotionResponsePayload {
  status: boolean;
  message: string;
  data: {
    id: string;
    promoStartsOn: string | null;
    promoEndsOn: string | null;
    isPromoActive: boolean;
  } | null;
}

export interface SetPromotionResponse {
  setPriceListPromotion: PromotionResponsePayload;
}

export interface ClearPromotionResponse {
  clearPriceListPromotion: PromotionResponsePayload;
}
