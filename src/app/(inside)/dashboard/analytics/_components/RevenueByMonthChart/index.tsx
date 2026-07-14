"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { REVENUE_BY_MONTH_QUERY } from "./gql";
import { RevenueByMonthResponse } from "./interface";
import { buildRevenueByMonthOption } from "./utils";

export function RevenueByMonthChart({ filters }: { filters: ChartFilters }) {
  const { data, loading, error, refetch } =
    useAsyncQuery<RevenueByMonthResponse>(REVENUE_BY_MONTH_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.revenueByMonth ?? [], [data]);
  const option = useMemo(() => buildRevenueByMonthOption(points), [points]);

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
