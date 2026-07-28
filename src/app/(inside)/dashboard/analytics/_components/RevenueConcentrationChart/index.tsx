"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { REVENUE_CONCENTRATION_QUERY } from "./gql";
import { RevenueConcentrationResponse } from "./interface";
import { buildConcentrationOption } from "./utils";

export function RevenueConcentrationChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const variables = useMemo(() => ({ ...filters, limit: 10 }), [filters]);

  const { data, loading, error, refetch } =
    useAsyncQuery<RevenueConcentrationResponse>(REVENUE_CONCENTRATION_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(
    () => data?.revenueConcentrationByClient ?? [],
    [data]
  );
  const option = useMemo(() => buildConcentrationOption(points), [points]);

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
