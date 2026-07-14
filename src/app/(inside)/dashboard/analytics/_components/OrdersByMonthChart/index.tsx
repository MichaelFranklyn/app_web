"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { ORDERS_BY_MONTH_QUERY } from "./gql";
import { OrdersByMonthResponse } from "./interface";
import { buildOrdersByMonthOption } from "./utils";

export function OrdersByMonthChart({ filters }: { filters: ChartFilters }) {
  const { data, loading, error, refetch } =
    useAsyncQuery<OrdersByMonthResponse>(ORDERS_BY_MONTH_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.ordersByMonth ?? [], [data]);
  const option = useMemo(() => buildOrdersByMonthOption(points), [points]);

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
