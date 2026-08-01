"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { ITEMS_PER_ORDER_BY_FACTORY_QUERY } from "./gql";
import { ItemsPerOrderResponse } from "./interface";
import { buildItemsPerOrderOption } from "./utils";

/** "O pedido daquela fábrica é reposição de um produto ou coleção inteira?" */
export function ItemsPerOrderChart({ filters }: { filters: ChartFilters }) {
  const variables = useMemo(() => ({ ...filters, limit: 8 }), [filters]);

  const { data, loading, error, refetch } =
    useAsyncQuery<ItemsPerOrderResponse>(ITEMS_PER_ORDER_BY_FACTORY_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.itemsPerOrderByFactory ?? [], [data]);
  const option = useMemo(() => buildItemsPerOrderOption(points), [points]);

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
