/** Em que pé está a parcela — o enum `BillingSituation` do schema. */
export type BillingSituation = "DUE" | "OVERDUE" | "PAID";

/** Uma duplicata do período, com o pedido de onde ela saiu. */
export interface BillingRow {
  installmentId: string;
  orderId: string;
  sequence: number;
  clientId: string;
  clientName: string;
  factoryId: string;
  factoryName: string;
  sellerId: string;
  sellerName: string;
  invoicedAt: string | null;
  dueDate: string | null;
  amount: string;
  commissionAmount: string;
  situation: BillingSituation;
  paidAt: string | null;
  daysOverdue: number;
  isCommissionReceived: boolean;
}

/** O fechamento do período, do mesmo recorte das linhas. */
export interface BillingReport {
  rows: BillingRow[];
  installmentCount: number;
  orderCount: number;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  overdueAmount: string;
  overdueCount: number;
  commissionAmount: string;
}

export interface BillingReportResponse {
  billingReport: BillingReport;
}

/** Recorte local da aba: qual situação das parcelas está à vista. */
export type BillingScope = "all" | "due" | "overdue" | "paid";
