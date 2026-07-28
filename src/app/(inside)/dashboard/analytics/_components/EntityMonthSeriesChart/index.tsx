"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartCanvas } from "../ChartCanvas";
import {
  EntityMonthSeriesChartProps,
  EntityMonthSeriesResponse,
} from "./interface";
import { buildEntityMonthSeriesOption, pivotEntityMonths } from "./utils";

/**
 * Evolução mensal comparando entidades (vendedores ou fábricas). As duas
 * agregações têm o mesmo formato e a mesma leitura, então o componente é
 * parametrizado por query/dataKey em vez de duplicado.
 */
export function EntityMonthSeriesChart({
  filters,
  query,
  dataKey,
  limit = 5,
}: EntityMonthSeriesChartProps) {
  const variables = useMemo(() => ({ ...filters, limit }), [filters, limit]);

  const { data, loading, error, refetch } =
    useAsyncQuery<EntityMonthSeriesResponse>(query, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const pivoted = useMemo(
    () => pivotEntityMonths(data?.[dataKey] ?? []),
    [data, dataKey]
  );
  const option = useMemo(
    () => buildEntityMonthSeriesOption(pivoted),
    [pivoted]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={pivoted.series.length > 0}
      option={option}
      error={error}
      onRetry={() => refetch()}
    />
  );
}
