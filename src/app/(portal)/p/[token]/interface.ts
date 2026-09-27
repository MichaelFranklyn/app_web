export type PortalOrderStatus = "CONFIRMED" | "INVOICED" | "DELIVERED";
export type PortalInstallmentStatus = "PENDING" | "PAID" | "CANCELLED";

export interface PortalProfile {
  clientName: string;
  clientCity: string | null;
  clientState: string | null;
  companyName: string;
  companyLogoUrl: string | null;
  /** O plano do escritório inclui o pedido de reposição pelo portal. */
  canRequestReplenishment: boolean;
}

export interface PortalOrder {
  id: string;
  orderDate: string;
  factoryName: string;
  totalAmount: string;
  ipiAmount: string;
  status: PortalOrderStatus;
  invoicedAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryDate: string | null;
}

export interface PortalOrderItem {
  id: string;
  productName: string;
  sku: string | null;
  quantity: string;
  unitPrice: string;
  subtotal: string;
  ipiAmount: string;
}

export interface PortalInstallment {
  sequence: number;
  amount: string;
  dueDate: string | null;
  status: PortalInstallmentStatus;
  paidAt: string | null;
}

export interface PortalOrderDetail extends PortalOrder {
  paymentTermName: string | null;
  items: PortalOrderItem[];
  installments: PortalInstallment[];
}

export interface PortalMonthTotal {
  month: string;
  amount: string;
  orderCount: number;
}

export interface PortalFactoryTotal {
  factoryName: string;
  amount: string;
  orderCount: number;
}

export interface PortalPurchaseSummary {
  totalAmount: string;
  orderCount: number;
  averageTicket: string;
  months: PortalMonthTotal[];
  factories: PortalFactoryTotal[];
}

export interface PortalStockItem {
  productId: string;
  productName: string;
  sku: string | null;
  factoryName: string;
  lastPurchaseDate: string | null;
  estimatedStockoutDate: string | null;
  daysRemaining: number | null;
  lastReportedAt: string | null;
}

export interface PortalOrdersConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
  edges: Array<{ node: PortalOrder }>;
}

export interface PortalProfileData {
  portalProfile: { data: PortalProfile | null } | null;
}

export interface PortalPurchasesData {
  portalPurchaseSummary: { data: PortalPurchaseSummary | null } | null;
  portalOrders: PortalOrdersConnection | null;
}

export interface PortalOrderData {
  portalOrder: { data: PortalOrderDetail | null } | null;
}

export interface PortalStockData {
  portalStock: { data: PortalStockItem[] } | null;
}

/** Produto acabando, pronto para o cliente pedir. Sem preço: nasce orçamento. */
export interface PortalReplenishmentItem {
  productId: string;
  productName: string;
  sku: string | null;
  factoryName: string;
  daysRemaining: number;
  lastPurchaseDate: string | null;
  /** Decimal em string (unidades). */
  suggestedQuantity: string;
  /** De quantas em quantas unidades a fábrica vende. Nulo = venda livre. */
  saleMultiple: string | null;
  /** Já pedido e esperando o representante confirmar. */
  pendingQuantity: string | null;
}

export interface PortalReplenishmentData {
  portalReplenishment: {
    data: { horizonDays: number; items: PortalReplenishmentItem[] } | null;
  } | null;
}
