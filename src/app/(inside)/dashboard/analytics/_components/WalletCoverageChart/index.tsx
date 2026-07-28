"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { WALLET_COVERAGE_QUERY } from "./gql";
import { WalletCoverageResponse } from "./interface";
import { buildWalletCoverageOption } from "./utils";

export function WalletCoverageChart({ filters }: { filters: ChartFilters }) {
  const variables = useMemo(() => ({ ...filters, limit: 8 }), [filters]);

  const { data, loading, error, refetch } =
    useAsyncQuery<WalletCoverageResponse>(WALLET_COVERAGE_QUERY, {
      variables,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.walletCoverageBySeller ?? [], [data]);
  const option = useMemo(() => buildWalletCoverageOption(points), [points]);

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
