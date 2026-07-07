export interface RevenueByFactoryPoint {
  factoryId: string;
  factoryName: string;
  total: string;
}

export interface RevenueByFactoryResponse {
  revenueByFactory: RevenueByFactoryPoint[];
}
