"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { CLIENT_RETENTION_QUERY } from "./gql";
import { ClientRetentionResponse } from "./interface";
import { buildClientRetentionOption } from "./utils";

export function ClientRetentionChart({ filters }: { filters: ChartFilters }) {
  const { data, loading, error, refetch } =
    useAsyncQuery<ClientRetentionResponse>(CLIENT_RETENTION_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.clientRetentionByMonth ?? [], [data]);
  const option = useMemo(() => buildClientRetentionOption(points), [points]);

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
