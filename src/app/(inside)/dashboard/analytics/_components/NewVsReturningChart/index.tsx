"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { NEW_VS_RETURNING_QUERY } from "./gql";
import { NewVsReturningResponse } from "./interface";
import { buildNewVsReturningOption } from "./utils";

export function NewVsReturningChart({ filters }: { filters: ChartFilters }) {
  const { data, loading, error, refetch } =
    useAsyncQuery<NewVsReturningResponse>(NEW_VS_RETURNING_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(
    () => data?.newVsReturningClientsByMonth ?? [],
    [data]
  );
  const option = useMemo(() => buildNewVsReturningOption(points), [points]);

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
