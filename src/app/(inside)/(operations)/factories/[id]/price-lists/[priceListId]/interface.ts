export interface PriceListDetail {
  id: string;
  name: string;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  promoStartsOn: string | null;
  promoEndsOn: string | null;
  isPromoActive: boolean;
}

export interface PriceListDetailResponse {
  price_list_detail: {
    status: boolean;
    message: string;
    data: PriceListDetail | null;
  };
}
