"use client";

import { useMemo } from "react";

import { ChartFilters } from "../../../../interface";
import { ChartCanvas } from "../../../ChartCanvas";
import { useCommissionRows } from "../../useCommissionRows";
import {
  buildCommissionByFactoryOption,
  rankFactoryCommissions,
} from "./utils";

/** "De qual fábrica vem a minha comissão." */
export function CommissionByFactoryChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { rows, loading, error, refetch } = useCommissionRows(filters);

  const factories = useMemo(() => rankFactoryCommissions(rows), [rows]);
  const option = useMemo(
    () => buildCommissionByFactoryOption(factories),
    [factories]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={factories.length > 0}
      option={option}
      error={error}
      onRetry={refetch}
    />
  );
}
