export interface CommissionChartRow {
  receiveDate: string | null;
  amount: string;
  isReceivable: boolean;
  isReceived: boolean;
  seller: { id: string } | null;
}

export interface CommissionsForChartResponse {
  commissions: {
    rows: CommissionChartRow[];
  };
}

export interface CommissionMonthlyBucket {
  month: string; // "YYYY-MM"
  receivable: number;
  received: number;
}
