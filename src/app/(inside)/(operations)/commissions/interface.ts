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
  /** Nota fiscal do pedido: a chave pela qual a planilha da fábrica é conferida. */
  invoiceNumber: string | null;
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
  /** A fábrica já descontou o estorno do escritório. */
  isChargebackSettled: boolean;
  chargebackSettledAt: string | null;
  /** Fatia do vendedor (negativa em estorno). */
  sellerAmount: string;
  sellerStatus: CommissionStatus;
  sellerReceiveDate: string | null;
  /** O escritório já repassou a fatia ao vendedor. */
  isSellerPaid: boolean;
  /** Mês do desconto do estorno no vendedor; null = ainda na fila. */
  sellerChargebackMonth: string | null;
  /** O escritório já descontou o estorno do vendedor. */
  isSellerChargebackSettled: boolean;
  sellerChargebackSettledAt: string | null;
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

/** Um par valor/rótulo das opções do painel de filtros (vem do servidor). */
export interface CommissionOption {
  value: string;
  label: string;
}

/** Os três cartões do mês, somados no servidor sobre o recorte COMPLETO. */
export interface CommissionMonthTotalsData {
  receivable: string;
  received: string;
  pending: string;
  countReceivable: number;
  chargeback: string;
  refund: string;
}

export interface CommissionMonthSplitData {
  company: string;
  seller: string;
  office: string;
  margin: number;
  count: number;
}

/** O resumo de uma fábrica no recorte — todas as parcelas dela, não só a página. */
export interface CommissionMonthGroupData {
  factoryId: string;
  name: string;
  count: number;
  reconciledCount: number;
  receivable: string;
  received: string;
  pending: string;
  chargeback: string;
  refund: string;
  overdueCount: number;
  /** Parcelas a receber da FÁBRICA — o lote do "Receber tudo desta fábrica". */
  receivableIds: string[];
}

export interface CommissionMonthData {
  /** Data mais recente em que alguma comissão cai — medida antes do recorte. */
  latestReceiveDate: string | null;
  /** Alguma comissão cai no mês pedido. */
  hasMovement: boolean;
  /** Existe comissão em algum mês, mesmo que não neste. */
  hasAnyCommission: boolean;
  /** O painel de filtros tirou linhas da tela. */
  isFiltered: boolean;
  /** Parcelas que mês e situação deixam passar, antes do painel de filtros. */
  scopeTotal: number;
  /** Depois do painel — a soma dos cartões das fábricas. */
  totalCount: number;
  monthTotals: CommissionMonthTotalsData;
  split: CommissionMonthSplitData;
  groups: CommissionMonthGroupData[];
  /** Estornos do vendedor em qualquer fase (não seguem mês nem aba). */
  chargebacks: CommissionRow[];
  sellerMonthCommissions: { sellerId: string; amount: string }[];
  factoryOptions: CommissionOption[];
  sellerOptions: CommissionOption[];
  statusOptions: CommissionOption[];
}

/** Uma página das parcelas de uma fábrica. */
export interface CommissionFactoryRowsData {
  /** De qual fábrica são as linhas; nulo quando o recorte está vazio. */
  factoryId: string | null;
  totalCount: number;
  rows: CommissionRow[];
}

export interface CommissionsResponse {
  commission_month: CommissionMonthData;
  /** A primeira página do primeiro cartão, no mesmo cálculo do resumo. */
  first_card: CommissionFactoryRowsData;
}

export interface CommissionsFactoryRowsResponse {
  commission_month_rows: CommissionFactoryRowsData;
}

/**
 * O recorte da tela, como o servidor o recebe (`CommissionMonthInput`). É o
 * MESMO objeto para o resumo e para as páginas das fábricas.
 */
export interface CommissionMonthInput {
  from: string;
  to: string;
  sellerId: string | null;
  audience: "office" | "seller";
  tab: string;
  search?: string;
  factoryId?: string;
  panelSellerId?: string;
  status?: string;
  installmentState?: string;
  reconciled?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface SellerOption {
  id: string;
  name: string;
}

export interface CommissionsSellersResponse {
  commissions_sellers: {
    edges: { node: SellerOption }[];
    totalCount: number;
  };
}
