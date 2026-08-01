"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { BACKORDER_BY_MONTH_QUERY } from "./gql";
import { BackorderByMonthResponse } from "./interface";
import { buildBackorderWeightOption, hasBackorders } from "./utils";

/** "Quanto dos meus pedidos é sobra de faturamento parcial, e não venda nova." */
export function BackorderWeightChart({ filters }: { filters: ChartFilters }) {
  const { data, loading, error, refetch } =
    useAsyncQuery<BackorderByMonthResponse>(BACKORDER_BY_MONTH_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.backorderByMonth ?? [], [data]);
  const option = useMemo(() => buildBackorderWeightOption(points), [points]);

  return (
    <ChartCanvas
      loading={loading}
      hasData={hasBackorders(points)}
      option={option}
      error={error}
      onRetry={() => refetch()}
      // Vazio aqui é boa notícia: nenhuma fábrica faturou pela metade no período.
      emptyTitle="Nenhuma sobra de faturamento"
      emptyDescription="No período, todo pedido faturado saiu inteiro — nenhuma fábrica deixou saldo para depois."
    />
  );
}
