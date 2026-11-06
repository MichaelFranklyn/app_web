import type { OrderStatus } from "@/app/(inside)/_shared/orderStatus";

export interface ClientLastPurchase {
  factoryId: string;
  factory: {
    id: string;
    nickname?: string | null;
    nomeFantasia?: string | null;
    razaoSocial?: string | null;
  } | null;
  sellerId: string;
  seller: { id: string; name: string } | null;
  lastOrderId: string;
  lastOrderDate: string;
  lastOrderAmount: string;
  lastOrderStatus: OrderStatus;
  orderCount: number;
  totalAmount: string;
}

export interface ClientLastPurchasesQueryResponse {
  companyClient: {
    data: { id: string; lastPurchases: ClientLastPurchase[] } | null;
  };
}

/** Por qual ponta do par a tabela agrupa. */
export type PurchaseView = "factory" | "seller";

/** Uma linha da tabela: o grupo (fábrica ou vendedor) e a compra mais recente dele. */
export interface PurchaseGroupRow {
  key: string;
  /** Nome do grupo: a fábrica (visão por fábrica) ou o vendedor. */
  name: string;
  /** A outra ponta da compra mais recente: quem vendeu, ou de qual fábrica. */
  counterpart: string;
  lastOrderId: string;
  lastOrderDate: string;
  lastOrderAmount: string;
  orderCount: number;
  totalAmount: number;
}
