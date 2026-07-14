"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { COMMISSIONS_FOR_CHART_QUERY } from "./gql";
import { CommissionsForChartResponse } from "./interface";
import { bucketCommissionsByMonth, buildCommissionsOption } from "./utils";

export function CommissionsByMonthChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { data, loading, error, refetch } =
    useAsyncQuery<CommissionsForChartResponse>(COMMISSIONS_FOR_CHART_QUERY, {
      skip: false,
    });

  const buckets = useMemo(
    () => bucketCommissionsByMonth(data?.commissions.rows ?? [], filters),
    [data, filters]
  );
  const option = useMemo(() => buildCommissionsOption(buckets), [buckets]);

  return (
    <ChartCanvas
      loading={loading}
      hasData={buckets.length > 0}
      option={option}
      error={error}
      onRetry={() => refetch()}
    />
  );
}
