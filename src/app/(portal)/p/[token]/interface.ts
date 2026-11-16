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
  /** Sem IPI e sem o imposto embutido — a mercadoria da linha. */
  subtotal: string;
  ipiAmount: string;
  /** Alíquota do IPI (3.25 = 3,25%). Zero quando a fábrica não cobra IPI à parte. */
  ipiRate: string;
  /** Imposto embutido no preço da linha (ST e afins). */
  taxAmount: string;
  /** Preço por unidade com o imposto embutido. */
  unitPriceWithTax: string;
}

export interface PortalInstallment {
  sequence: number;
  amount: string;
  dueDate: string | null;
  status: PortalInstallmentStatus;
  paidAt: string | null;
}

export interface PortalOrderDetail extends PortalOrder {
  /** Número do pedido no escritório — o mesmo que o representante vê. */
  number: number;
  /** Imposto embutido do pedido. Total = totalAmount + taxAmount + ipiAmount. */
  taxAmount: string;
  /** "fob" | "cif" (o backend devolve em minúsculas). Nulo = não informado. */
  freightType: string | null;
  paymentTermName: string | null;
  /** O representante do pedido — o destino do email e do WhatsApp. */
  sellerName: string | null;
  sellerEmail: string | null;
  sellerPhone: string | null;
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

export interface PortalProfileData {
  portalProfile: { data: PortalProfile | null } | null;
}

export interface PortalPurchaseSummaryData {
  portalPurchaseSummary: { data: PortalPurchaseSummary | null } | null;
}

export interface PortalOrderData {
  portalOrder: { data: PortalOrderDetail | null } | null;
}

export interface PortalStockData {
  portalStock: { data: PortalStockItem[] } | null;
}

/** Produto acabando, pronto para o cliente pedir, com o preço estimado. */
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
  factoryId: string;
  /** Foto do produto (caminho cru; resolver com `mediaUrl`). */
  imageUrl: string | null;
  /** Preço ESTIMADO por unidade no nível do cliente. Nulo = sem preço na tabela. */
  estimatedUnitPrice: string | null;
  /** O preço estimado já com o imposto do produto. Nulo = sem preço. */
  estimatedUnitPriceWithTax: string | null;
  isPromo: boolean;
  /** O que o cliente pagou por unidade na última compra. Nulo = nunca comprou. */
  lastUnitPrice: string | null;
}

export interface PortalReplenishmentData {
  portalReplenishment: {
    data: { horizonDays: number; items: PortalReplenishmentItem[] } | null;
  } | null;
}

/** Produto do catálogo do orçamento livre. */
export interface PortalCatalogItem {
  productId: string;
  productName: string;
  sku: string | null;
  factoryName: string;
  /** Decimal em string: a última compra, ou o múltiplo de venda. */
  suggestedQuantity: string;
  saleMultiple: string | null;
  pendingQuantity: string | null;
  lastPurchaseDate: string | null;
  /** Preço ESTIMADO por unidade no nível do cliente. Nulo = sem preço na tabela. */
  estimatedUnitPrice: string | null;
  /** O preço estimado já com o imposto do produto. Nulo = sem preço. */
  estimatedUnitPriceWithTax: string | null;
  isPromo: boolean;
  /** O que o cliente pagou por unidade na última compra. Nulo = nunca comprou. */
  lastUnitPrice: string | null;
  factoryId: string;
  /** Foto do produto (caminho cru; resolver com `mediaUrl`). */
  imageUrl: string | null;
}

/** Fábrica que atende o cliente — as opções do seletor do orçamento. */
export interface PortalCatalogFactory {
  factoryId: string;
  name: string;
}

export interface PortalCatalog {
  total: number;
  page: number;
  pageSize: number;
  /** Fábrica do orçamento (nula = o cliente ainda não escolheu). */
  factoryId: string | null;
  factories: PortalCatalogFactory[];
  items: PortalCatalogItem[];
}

export interface PortalCatalogData {
  portalCatalog: { data: PortalCatalog | null } | null;
}

/**
 * Situação de um pedido que o cliente mandou pelo portal. DRAFT/SENT = ainda
 * com o representante; CONFIRMED em diante = virou pedido; CANCELLED = não foi.
 */
export type PortalSentOrderStatus =
  | "DRAFT"
  | "SENT"
  | "CONFIRMED"
  | "INVOICED"
  | "DELIVERED"
  | "CANCELLED";

/** Um pedido que o cliente mandou ao representante pelo portal. */
export interface PortalSentOrder {
  id: string;
  /** O número que o representante e a fábrica usam para achar o pedido. */
  number: number;
  createdAt: string;
  factoryName: string;
  status: PortalSentOrderStatus;
  /** Estimado enquanto o representante não confirma. */
  totalAmount: string;
  ipiAmount: string;
  /** Imposto embutido estimado. Total = totalAmount + taxAmount + ipiAmount. */
  taxAmount: string;
  itemCount: number;
  /** Quando o representante marcou que viu. Nulo = ainda não viu. */
  seenBySellerAt: string | null;
  clientRequestNote: string | null;
  sellerName: string | null;
  sellerEmail: string | null;
  sellerPhone: string | null;
}

export interface PortalSentOrderDetail extends PortalSentOrder {
  items: PortalOrderItem[];
}

/** Recorte da lista "Pedidos": tudo, só pedidos feitos ou só orçamentos. */
export type PortalOrderKind = "ALL" | "ORDER" | "QUOTE";

export interface PortalSentOrdersData {
  portalSentOrders: {
    total: number;
    page: number;
    limit: number;
    data: PortalSentOrder[];
  } | null;
}

/** O placar da lista de pedidos — contagens de TODOS, não só da página. */
export interface PortalSentOrdersSummary {
  total: number;
  /** O representante ainda não viu. */
  waiting: number;
  /** O representante viu e ainda não confirmou. */
  seen: number;
  /** Confirmado, faturado ou entregue. */
  ordered: number;
  cancelled: number;
}

export interface PortalSentOrdersSummaryData {
  portalSentOrdersSummary: { data: PortalSentOrdersSummary | null } | null;
}

export interface PortalSentOrderData {
  portalSentOrder: { data: PortalSentOrderDetail | null } | null;
}
