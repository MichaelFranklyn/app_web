import { OrderStatus } from "../interface";

export interface OrderDetailResponse {
  order: {
    status: boolean;
    code: number;
    message: string;
    data: OrderDetail | null;
  };
}

export type InstallmentStatus = "PENDING" | "PAID" | "CANCELLED";

export interface PaymentTermRef {
  id: string;
  name: string;
  installmentsDays: number[];
  /** Piso de faturamento exigido pela fábrica; null = prazo sem mínimo. */
  minOrderAmount: number | null;
}

export interface OrderInstallment {
  id: string;
  sequence: number;
  amount: string;
  commissionAmount: string;
  dueDate: string | null;
  status: InstallmentStatus;
  paidAt: string | null;
  isCommissionReceived: boolean;
  commissionReceivedAt: string | null;
}

/** Referência enxuta a um pedido de backorder (filho) para exibir o vínculo. */
export interface BackorderRef {
  id: string;
  status: OrderStatus;
  totalAmount: string;
}

export interface OrderDetail {
  id: string;
  orderDate: string;
  totalAmount: string;
  ipiAmount: string;
  /** Imposto embutido agregado (soma dos taxAmount dos itens); exibição, fora da base de comissão. */
  taxAmount: string;
  ipiInOrder: boolean;
  commissionAmount: string;
  status: OrderStatus;
  fileUrl: string | null;
  isFileParsed: boolean;
  notes: string | null;
  freightType: "FOB" | "CIF" | null;
  createdAt: string;
  invoicedAt: string | null;
  /** Data em que a mercadoria chegou na loja; nulo até confirmar a entrega. */
  deliveredAt: string | null;
  /** Prazo de entrega estimado (dias), contado do faturamento. */
  deliveryEstimateDays: number | null;
  /** Dias que o vendedor estima que este pedido dura na loja do cliente. */
  coverageDays: number | null;
  /** Data prevista de entrega = invoicedAt + deliveryEstimateDays; nulo sem os dois. */
  estimatedDeliveryDate: string | null;
  /** Faturado, prazo vencido e não entregue — pede confirmação de entrega. */
  isDeliveryOverdue: boolean;
  paymentTermId: string | null;
  commissionCalcBasis: string | null;
  /** Pedido-pai quando este é o restante (backorder) de um faturamento parcial. */
  parentOrderId: string | null;
  isBackorder: boolean;
  parentOrder: { id: string; orderDate: string } | null;
  /** Pedidos-filhos (backorders) gerados por faturamentos parciais deste pedido. */
  backorderChildren: BackorderRef[];
  seller: { id: string; name: string } | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string;
    addressCity: string | null;
    addressState: string | null;
  } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    nickname: string | null;
    razaoSocial: string;
    logoUrl: string | null;
  } | null;
  paymentTerm: PaymentTermRef | null;
  availablePaymentTerms: PaymentTermRef[];
  installments: OrderInstallment[];
}

export interface OrderItemsResponse {
  orderItems: {
    edges: { node: OrderItem }[];
    totalCount: number;
  };
}

/** Imposto vinculado ao produto; `rate` é percentual (3.25 = 3,25%). */
export interface OrderItemProductTax {
  id: string;
  rate: string;
  taxRule: { id: string; name: string } | null;
}

export interface OrderItem {
  id: string;
  quantity: string;
  unitsTotal: string;
  unitPrice: string;
  discount: string;
  subtotal: string;
  ipiRate: string;
  ipiAmount: string;
  /** Imposto da linha (informativo): já embutido no preço, fora do total. */
  taxAmount: string;
  /** Preço unitário COM imposto; igual a unitPrice em produto sem imposto. */
  unitPriceWithTax: string;
  /** Item vendido sob promoção relâmpago. */
  isPromo: boolean;
  /** Momento da criação — usado para ordenar do mais novo para o mais antigo. */
  createdAt: string;
  avgShelfDays: number | null;
  source: "MANUAL" | "IMPORTED" | "TEMPLATE";
  product: {
    id: string;
    name: string;
    sku: string;
    /** Foto do produto; usada na versão ilustrada do PDF do pedido. */
    imageUrl: string | null;
    saleMultiple: string | null;
    unitPerPack: string;
    taxes: OrderItemProductTax[];
  } | null;
  tier: { id: string; name: string } | null;
}
