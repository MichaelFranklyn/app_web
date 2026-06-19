export interface SellerDetail {
  id: string;
  name: string;
  phone: string | null;
  cpf: string | null;
  region: string | null;
  homeCep: string | null;
  homeStreet: string | null;
  homeNumber: string | null;
  homeComplement: string | null;
  homeNeighborhood: string | null;
  homeCity: string | null;
  homeState: string | null;
  isActive: boolean;
  factoryCount: number;
  clientCount: number;
  totalRevenue: string;
  lastOrderDate: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
  } | null;
}

export interface SellerDetailQueryResponse {
  seller_detail: {
    status: boolean;
    message: string;
    data: SellerDetail | null;
  };
}
