export interface VisitConversionPoint {
  month: string;
  visits: number;
  ordersFromVisits: number;
  conversionRate: number;
}

export interface VisitConversionResponse {
  visitConversionByMonth: VisitConversionPoint[];
}
