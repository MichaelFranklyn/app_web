"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { ORDER_STATUS_BY_MONTH_QUERY } from "./gql";
import { OrderStatusByMonthResponse } from "./interface";
import { buildOrderStatusByMonthOption } from "./utils";

export function OrderStatusByMonthChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { data, loading, error, refetch } =
    useAsyncQuery<OrderStatusByMonthResponse>(ORDER_STATUS_BY_MONTH_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.orderStatusByMonth ?? [], [data]);
  const option = useMemo(() => buildOrderStatusByMonthOption(points), [points]);

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
