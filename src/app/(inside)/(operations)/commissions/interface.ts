// A situação da parcela mora no vocabulário compartilhado (`_shared/commissions`),
// junto dos rótulos e das cores — para o tipo e a tradução não divergirem entre
// esta tela e o relatório de comissões.
import type { CommissionStatus } from "../../_shared/commissions";

export type { CommissionStatus };

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
  /** Boleto vencido e ainda não pago pelo cliente. */
  isOverdue: boolean;
  /** Quando o boleto virou calote; null = não é inadimplente. */
  defaultedAt: string | null;
  /** Fatia do vendedor (negativa em estorno). */
  sellerAmount: string;
  sellerStatus: CommissionStatus;
  sellerReceiveDate: string | null;
  /** O escritório já repassou a fatia ao vendedor. */
  isSellerPaid: boolean;
  /** Mês do desconto do estorno no vendedor; null = ainda na fila. */
  sellerChargebackMonth: string | null;
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
  /** Total (negativo) a devolver às fábricas por calote do cliente. */
  totalChargeback: string;
  totalSellerChargeback: string;
  /** Estornos do vendedor ainda sem mês de desconto escolhido. */
  totalSellerChargebackPending: string;
  countOverdue: number;
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
