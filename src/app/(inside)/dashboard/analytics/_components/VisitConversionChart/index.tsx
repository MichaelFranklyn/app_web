"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { ChartCanvas } from "../ChartCanvas";
import { VISIT_CONVERSION_QUERY } from "./gql";
import { VisitConversionResponse } from "./interface";
import { buildVisitConversionOption } from "./utils";

export function VisitConversionChart({ filters }: { filters: ChartFilters }) {
  const { data, loading, error, refetch } =
    useAsyncQuery<VisitConversionResponse>(VISIT_CONVERSION_QUERY, {
      variables: filters,
      skip: false,
      autoFetch: true,
    });

  const points = useMemo(() => data?.visitConversionByMonth ?? [], [data]);
  const option = useMemo(() => buildVisitConversionOption(points), [points]);

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
