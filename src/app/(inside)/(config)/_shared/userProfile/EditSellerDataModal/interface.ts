export interface UpdateSellerInput {
  region?: string;
}

export interface UpdateSellerResponse {
  updateSeller: {
    status: boolean;
    message: string;
  } | null;
}
