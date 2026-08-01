"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { ORDER_SIZE_DISTRIBUTION_QUERY } from "./gql";
import { OrderSizeDistributionResponse } from "./interface";
import { buildOrderSizeDistributionOption, hasOrderSizeData } from "./utils";

/** "Meu volume vem de muitos pedidos pequenos ou de poucos grandes?" */
export function OrderSizeDistributionChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { data, loading, error, refetch } =
    useAsyncQuery<OrderSizeDistributionResponse>(
      ORDER_SIZE_DISTRIBUTION_QUERY,
      {
        variables: filters,
        skip: false,
        autoFetch: true,
      }
    );

  const bands = useMemo(() => data?.orderSizeDistribution ?? [], [data]);
  const option = useMemo(
    () => buildOrderSizeDistributionOption(bands),
    [bands]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={hasOrderSizeData(bands)}
      option={option}
      error={error}
      onRetry={() => refetch()}
    />
  );
}
