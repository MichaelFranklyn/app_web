import type { QueryData as SellerListQueryData } from "./_components/SellersTab/SellerListContent/interface";
export type { SellerListQueryData };

export interface SellersStatsRaw {
  sellerStats: SellersStats;
}

export interface SellersStats {
  totalCount: number;
  activeCount: number;
  activeFactoryAccessCount: number;
  inactiveFactoryAccessCount: number;
}

export interface SellersContentProps {
  stats: SellersStats;
  initialData?: SellerListQueryData;
}

export interface UpdateSellerInput {
  name?: string;
  phone?: string;
  region?: string;
  homeCep?: string;
  homeStreet?: string;
  homeNumber?: string;
  homeComplement?: string;
  homeNeighborhood?: string;
  homeCity?: string;
  homeState?: string;
}
