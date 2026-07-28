"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { DELIVERY_PERFORMANCE_QUERY } from "./gql";
import { DeliveryPerformanceResponse } from "./interface";
import { buildDeliveryPerformanceOption } from "./utils";

export function DeliveryPerformanceChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const variables = useMemo(() => ({ ...filters, limit: 8 }), [filters]);

  const { data, loading, error, refetch } =
    useAsyncQuery<DeliveryPerformanceResponse>(DELIVERY_PERFORMANCE_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(
    () => data?.deliveryPerformanceByFactory ?? [],
    [data]
  );
  const option = useMemo(
    () => buildDeliveryPerformanceOption(points),
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
