// Definido junto dos rótulos, em `_shared/orderStatus`, para o tipo e o mapa de
// tradução nunca saírem de sincronia.
import type { OrderStatus } from "../../_shared/orderStatus";

export type { OrderStatus };

export interface Order {
  id: string;
  orderDate: string;
  /** Quando a fábrica faturou. Nulo enquanto o pedido não foi faturado. */
  invoicedAt: string | null;
  totalAmount: string;
  commissionAmount: string;
  status: OrderStatus;
  /**
   * Saldo de um faturamento parcial: o resto de um pedido que a fábrica não
   * entregou inteiro. É a mesma venda — não conta como pedido novo.
   */
  isBackorder: boolean;
  /** Faturado, prazo de entrega vencido e não entregue — pede confirmação. */
  isDeliveryOverdue: boolean;
  /** Data gravada se a entrega for confirmada sem outra (faturamento + prazo). */
  expectedDeliveryDate: string | null;
  seller: { id: string; name: string } | null;
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
}

export interface OrdersStats {
  orderStats: {
    totalOrders: number;
    totalAmount: string;
    avgTicket: string;
    /** Pedidos que a fábrica já faturou, dentro do recorte filtrado. */
    invoicedOrders: number;
    invoicedAmount: string;
    /** Comissão gerada pelo que já foi faturado no recorte. */
    commissionAmount: string;
    /**
     * Saldos de faturamento parcial no recorte. Fora de `totalOrders` (são a
     * mesma venda), mas o valor deles soma nos totais.
     */
    backorderCount: number;
  };
}

/** Opções dos selects do painel de filtros. */
export interface OrderFilterSellers {
  order_filter_sellers: { edges: { node: { id: string; name: string } }[] };
}

export interface OrderFilterFactories {
  order_filter_factories: {
    edges: {
      node: {
        id: string;
        factory: {
          id: string;
          nomeFantasia: string | null;
          nickname: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

export interface OrderFilterClients {
  order_filter_clients: {
    edges: {
      node: {
        id: string;
        razaoSocial: string;
        nomeFantasia: string | null;
        cnpj: string | null;
      };
    }[];
  };
}

export interface QueryData {
  orders_list: {
    edges: { node: Order }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

// Itens por página. Compartilhado entre o fetch SSR (page.tsx) e o useTableData
// (content.tsx) para as variáveis da query não divergirem.
export const ITEMS_PER_PAGE = 15;
