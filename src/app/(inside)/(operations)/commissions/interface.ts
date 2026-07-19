export type CommissionStatus =
  | "pending"
  | "receivable"
  | "received"
  | "cancelled";

export interface CommissionRow {
  orderId: string;
  installmentId: string;
  sequence: number;
  orderDate: string;
  invoicedAt: string | null;
  dueDate: string | null;
  paidAt: string | null;
  installmentAmount: string;
  amount: string;
  status: CommissionStatus;
  receiveDate: string | null;
  isReceivable: boolean;
  isReceived: boolean;
  isReconciled: boolean;
  reconciledAt: string | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  seller: { id: string; name: string } | null;
}

export interface CommissionsSummary {
  totalReceivable: string;
  totalReceived: string;
  totalPending: string;
  countReceivable: number;
  rows: CommissionRow[];
}

export interface CommissionsResponse {
  commissions: CommissionsSummary;
}

export interface SellerOption {
  id: string;
  name: string;
}

export interface CommissionsSellersResponse {
  commissions_sellers: {
    edges: { node: SellerOption }[];
  };
}
