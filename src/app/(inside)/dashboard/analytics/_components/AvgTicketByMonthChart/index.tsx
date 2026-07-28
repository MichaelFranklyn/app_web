"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { AVG_TICKET_BY_MONTH_QUERY } from "./gql";
import { AvgTicketByMonthResponse } from "./interface";
import { buildAvgTicketByMonthOption } from "./utils";

export function AvgTicketByMonthChart({ filters }: { filters: ChartFilters }) {
  const { data, loading, error, refetch } =
    useAsyncQuery<AvgTicketByMonthResponse>(AVG_TICKET_BY_MONTH_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.avgTicketByMonth ?? [], [data]);
  const option = useMemo(() => buildAvgTicketByMonthOption(points), [points]);

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
