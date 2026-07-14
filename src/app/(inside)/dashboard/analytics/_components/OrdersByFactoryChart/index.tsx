"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { ORDERS_BY_FACTORY_QUERY } from "./gql";
import { OrdersByFactoryResponse } from "./interface";
import { buildOrdersByFactoryDonutOption } from "./utils";

export function OrdersByFactoryChart({ filters }: { filters: ChartFilters }) {
  const variables = useMemo(() => ({ ...filters, limit: 8 }), [filters]);

  const { data, loading, error, refetch } =
    useAsyncQuery<OrdersByFactoryResponse>(ORDERS_BY_FACTORY_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.ordersByFactory ?? [], [data]);
  const option = useMemo(
    () => buildOrdersByFactoryDonutOption(points),
    [points]
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
