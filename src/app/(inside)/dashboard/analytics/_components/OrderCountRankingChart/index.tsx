"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartCanvas } from "../ChartCanvas";
import { OrderCountRankingChartProps, OrderCountResponse } from "./interface";
import { buildOrderCountRankingOption } from "./utils";

/** Ranking genérico de "quantos pedidos" por cliente ou por vendedor. */
export function OrderCountRankingChart({
  filters,
  query,
  dataKey,
  color,
  limit = 8,
}: OrderCountRankingChartProps) {
  const variables = useMemo(() => ({ ...filters, limit }), [filters, limit]);

  const { data, loading, error, refetch } = useAsyncQuery<OrderCountResponse>(
    query,
    { variables, skip: false, autoFetch: true }
  );

  const points = useMemo(() => data?.[dataKey] ?? [], [data, dataKey]);
  const option = useMemo(
    () => buildOrderCountRankingOption(points, color),
    [points, color]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={points.length > 0}
      option={option}
      error={error}
      onRetry={() => refetch()}
    />
  );
}
