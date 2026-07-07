import { DocumentNode } from "@apollo/client";

import { ChartFilters } from "../../interface";

/** Linha crua vinda do backend. `avgTicket` (Decimal→string) e `avgDays`
 * (Float→number) são mutuamente exclusivos conforme a query. */
export interface RawEntityRow {
  entityId: string;
  entityName: string;
  orderCount: number;
  avgTicket?: string;
  avgDays?: number;
}

/** As 5 queries de ranking têm chaves de topo distintas; o componente lê a
 * própria via `dataKey`, então tipamos o payload como um mapa. */
export type EntityRankingResponse = Record<string, RawEntityRow[]>;

/** Ponto já normalizado para o gráfico. */
export interface EntityPoint {
  entityName: string;
  value: number;
  orderCount: number;
}

export type EntityValueKey = "avgTicket" | "avgDays";

export interface EntityRankingChartProps {
  filters: ChartFilters;
  /** Documento GraphQL de gql.ts. */
  query: DocumentNode;
  /** Nome do campo de topo do payload (ex.: "avgTicketByFactory"). */
  dataKey: string;
  /** Campo de valor de cada linha (ticket em R$ ou intervalo em dias). */
  valueKey: EntityValueKey;
  /** Formata o valor no eixo e no tooltip (money ou "X dias"). */
  valueFormatter: (v: number) => string;
  /** Nome da série (rótulo no tooltip). */
  seriesName: string;
  /** Cor da barra (hex da paleta do chartTheme). */
  color: string;
}
