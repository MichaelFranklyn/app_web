"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { ORDERS_AND_TICKET_BY_MONTH_QUERY } from "./gql";
import { OrdersAndTicketResponse } from "./interface";
import { buildOrdersAndTicketOption, toOrdersAndTicketPoints } from "./utils";

/** "O crescimento vem de mais pedidos ou de pedidos maiores?" */
export function OrdersAndTicketByMonthChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { data, loading, error, refetch } =
    useAsyncQuery<OrdersAndTicketResponse>(ORDERS_AND_TICKET_BY_MONTH_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => toOrdersAndTicketPoints(data), [data]);
  const option = useMemo(() => buildOrdersAndTicketOption(points), [points]);

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
