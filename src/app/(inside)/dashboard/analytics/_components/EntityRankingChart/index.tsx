"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartCanvas } from "../ChartCanvas";
import { EntityRankingChartProps, EntityRankingResponse } from "./interface";
import { buildEntityRankingOption, toEntityPoints } from "./utils";

/**
 * Gráfico genérico de "ranking por entidade" (vendedor/fábrica/cliente).
 * Todas as 5 agregações têm o mesmo formato e renderização (barra horizontal),
 * então parametrizamos por query/dataKey/valueKey em vez de duplicar 5 pastas.
 */
export function EntityRankingChart({
  filters,
  query,
  dataKey,
  valueKey,
  valueFormatter,
  seriesName,
  color,
}: EntityRankingChartProps) {
  const variables = useMemo(() => ({ ...filters, limit: 8 }), [filters]);

  const { data, loading } = useAsyncQuery<EntityRankingResponse>(query, {
    variables,
    skip: false,
    autoFetch: true,
  });

  const points = useMemo(
    () => toEntityPoints(data?.[dataKey] ?? [], valueKey),
    [data, dataKey, valueKey]
  );
  const option = useMemo(
    () =>
      buildEntityRankingOption(points, { valueFormatter, seriesName, color }),
    [points, valueFormatter, seriesName, color]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={points.length > 0}
      option={option}
    />
  );
}
