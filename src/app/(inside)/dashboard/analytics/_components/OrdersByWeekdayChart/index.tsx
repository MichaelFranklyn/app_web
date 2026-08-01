"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { ORDERS_BY_WEEKDAY_QUERY } from "./gql";
import { OrdersByWeekdayResponse } from "./interface";
import { buildOrdersByWeekdayOption, hasWeekdayData } from "./utils";

/** "Em que dia da semana o pedido fecha." */
export function OrdersByWeekdayChart({ filters }: { filters: ChartFilters }) {
  const { data, loading, error, refetch } =
    useAsyncQuery<OrdersByWeekdayResponse>(ORDERS_BY_WEEKDAY_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const days = useMemo(() => data?.ordersByWeekday ?? [], [data]);
  const option = useMemo(() => buildOrdersByWeekdayOption(days), [days]);

  return (
    <ChartCanvas
      loading={loading}
      hasData={hasWeekdayData(days)}
      option={option}
      error={error}
      onRetry={() => refetch()}
    />
  );
}
