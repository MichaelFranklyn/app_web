"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { CLIENTS_AT_RISK_QUERY } from "./gql";
import { ClientsAtRiskResponse } from "./interface";
import { buildClientsAtRiskOption } from "./utils";

export function ClientsAtRiskChart({ filters }: { filters: ChartFilters }) {
  const variables = useMemo(() => ({ ...filters, limit: 10 }), [filters]);

  const { data, loading, error, refetch } =
    useAsyncQuery<ClientsAtRiskResponse>(CLIENTS_AT_RISK_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.clientsAtRisk ?? [], [data]);
  const option = useMemo(() => buildClientsAtRiskOption(points), [points]);

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
