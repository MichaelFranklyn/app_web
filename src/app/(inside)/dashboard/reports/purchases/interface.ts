import type { OrderStatus } from "@/app/(inside)/_shared/orderStatus";

import { ClientSituation } from "../situation";

/**
 * A última compra de um cliente em UMA fábrica.
 *
 * A linha é o PAR cliente×fábrica, não o cliente: é o par que compra, que tem
 * ritmo próprio e que atrasa. O mesmo cliente aparece uma vez por fábrica.
 */
export interface PurchaseRow {
  clientId: string;
  /** Chave da rota /clients/[id] — é o vínculo na carteira, não o cliente global. */
  companyClientId: string;
  clientName: string;
  city: string | null;
  state: string | null;
  factoryId: string;
  factoryName: string;
  /** Quem atende o par hoje; sem vínculo ativo, quem vendeu da última vez. */
  sellerName: string | null;
  /** `false` = o vínculo foi desfeito e a linha existe pelo histórico. */
  isLinked: boolean;
  /** Situação medida contra o ritmo de compra DESTA fábrica. */
  situation: ClientSituation;
  /** O pedido da última compra — é por ele que se vê o que foi comprado. */
  lastOrderId: string | null;
  lastOrderDate: string | null;
  lastOrderAmount: string;
  /** Nome do enum `OrderStatus` (CONFIRMED, INVOICED, DELIVERED). */
  lastOrderStatus: OrderStatus | null;
  lastInvoicedAt: string | null;
  daysSinceLastOrder: number | null;
  /** Nulo com menos de 2 compras: sem a segunda não há ritmo próprio. */
  avgIntervalDays: number | null;
  riskRatio: number | null;
  orderCount: number;
  historyAmount: string;
  periodOrderCount: number;
  periodAmount: string;
}

export interface PurchasesReport {
  rows: PurchaseRow[];
  totalRows: number;
  clientCount: number;
  factoryCount: number;
  neverBoughtRows: number;
  atRiskRows: number;
  inactiveRows: number;
  periodOrderCount: number;
  periodAmount: string;
}

export interface PurchasesReportResponse {
  clientFactoryPurchasesReport: PurchasesReport;
}

/** Recorte local da aba: qual situação está à vista. */
export type PurchaseScope = "all" | ClientSituation;
