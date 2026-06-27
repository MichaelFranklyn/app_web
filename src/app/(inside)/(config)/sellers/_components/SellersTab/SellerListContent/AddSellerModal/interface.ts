import { Seller } from "../interface";

export type CreateSellerResult = Omit<Seller, "email">;

export interface CreateSellerResponse {
  createSeller: {
    status: boolean;
    message: string;
    data: CreateSellerResult | null;
  };
}

export interface UsersOptionsData {
  users_for_seller: {
    edges: { node: { id: string; name: string; email: string } }[];
  };
}

export interface SellersUserIdsData {
  sellers_user_ids: { edges: { node: { userId: string } }[] };
}
