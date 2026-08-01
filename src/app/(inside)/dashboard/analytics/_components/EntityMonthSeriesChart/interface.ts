import { DocumentNode } from "@apollo/client";

import { ChartFilters } from "../../interface";

/** Linha crua do backend: um par (mês, entidade). */
export interface EntityMonthPoint {
  month: string;
  entityId: string;
  entityName: string;
  total: string;
  orderCount: number;
}

/** Uma entidade virada em série contínua, alinhada com os meses do eixo. */
export interface EntitySeries {
  entityId: string;
  entityName: string;
  values: number[];
}

export interface PivotedSeries {
  months: string[];
  series: EntitySeries[];
}

/** Qual número da linha vira a série: dinheiro faturado ou nº de pedidos. */
export type EntityMonthValueKey = "total" | "orderCount";

export interface EntityMonthSeriesChartProps {
  filters: ChartFilters;
  query: DocumentNode;
  /** Nome do campo na resposta ("revenueBySellerMonth" | ...). */
  dataKey: string;
  /** Quantas entidades o backend deve trazer (top N por faturamento). */
  limit?: number;
  /**
   * Campo de valor de cada ponto. Padrão `total` (faturamento) — a mesma
   * agregação também devolve `orderCount`, o que responde "quantas VEZES cada
   * um vendeu" sem precisar de uma query nova.
   */
  valueKey?: EntityMonthValueKey;
  /** Formata o valor no eixo e no tooltip. Padrão: dinheiro. */
  valueFormatter?: (v: number) => string;
}

export type EntityMonthSeriesResponse = Record<string, EntityMonthPoint[]>;
