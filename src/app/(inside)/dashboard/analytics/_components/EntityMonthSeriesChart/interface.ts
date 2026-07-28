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

export interface EntityMonthSeriesChartProps {
  filters: ChartFilters;
  query: DocumentNode;
  /** Nome do campo na resposta ("revenueBySellerMonth" | ...). */
  dataKey: string;
  /** Quantas entidades o backend deve trazer (top N por faturamento). */
  limit?: number;
}

export type EntityMonthSeriesResponse = Record<string, EntityMonthPoint[]>;
