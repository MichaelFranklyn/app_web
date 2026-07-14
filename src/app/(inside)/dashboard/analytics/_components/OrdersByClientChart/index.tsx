"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { ORDERS_BY_CLIENT_QUERY } from "./gql";
import { OrdersByClientResponse } from "./interface";
import { buildOrdersByClientOption } from "./utils";

export function OrdersByClientChart({ filters }: { filters: ChartFilters }) {
  const variables = useMemo(() => ({ ...filters, limit: 8 }), [filters]);

  const { data, loading, error, refetch } =
    useAsyncQuery<OrdersByClientResponse>(ORDERS_BY_CLIENT_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.ordersByClient ?? [], [data]);
  const option = useMemo(() => buildOrdersByClientOption(points), [points]);

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
