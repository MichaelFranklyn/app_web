import { DocumentNode } from "@apollo/client";

import { ChartFilters } from "../../interface";

/** Ponto de contagem de pedidos por entidade (cliente/vendedor). */
export interface OrderCountPoint {
  entityId: string;
  entityName: string;
  orderCount: number;
}

/** As queries têm chaves de topo distintas; o componente lê a sua via dataKey. */
export type OrderCountResponse = Record<string, OrderCountPoint[]>;

export interface OrderCountRankingChartProps {
  filters: ChartFilters;
  query: DocumentNode;
  /** Nome do campo de topo do payload ("ordersByClient" | "ordersBySeller"). */
  dataKey: string;
  /** Cor da barra (hex da paleta do chartTheme). */
  color: string;
  /** Quantas entidades trazer (top N por volume). */
  limit?: number;
}
