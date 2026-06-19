export interface SellersQueryResponse {
  sellers_list: {
    edges: { node: Seller }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface QueryData {
  sellers_list: SellersQueryResponse["sellers_list"];
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
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
  lastOrderDate: string;
}
