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
}
