"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { REVENUE_BY_FACTORY_QUERY } from "./gql";
import { RevenueByFactoryResponse } from "./interface";
import { buildRevenueByFactoryOption } from "./utils";

export function RevenueByFactoryChart({ filters }: { filters: ChartFilters }) {
  const variables = useMemo(() => ({ ...filters, limit: 8 }), [filters]);

  const { data, loading, error, refetch } =
    useAsyncQuery<RevenueByFactoryResponse>(REVENUE_BY_FACTORY_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.revenueByFactory ?? [], [data]);
  const option = useMemo(() => buildRevenueByFactoryOption(points), [points]);

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
