export interface CreateSellerProfileResponse {
  createSeller: {
    status: boolean;
    message: string;
    data: { id: string; region: string | null; isActive: boolean } | null;
  } | null;
}
