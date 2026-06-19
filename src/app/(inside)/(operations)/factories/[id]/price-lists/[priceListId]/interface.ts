export interface PriceListDetail {
  id: string;
  name: string;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

export interface PriceListDetailResponse {
  price_list_detail: {
    status: boolean;
    message: string;
    data: PriceListDetail | null;
  };
}
