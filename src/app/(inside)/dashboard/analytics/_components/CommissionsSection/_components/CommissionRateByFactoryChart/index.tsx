"use client";

import { useMemo } from "react";

import { ChartFilters } from "../../../../interface";
import { ChartCanvas } from "../../../ChartCanvas";
import { useCommissionRows } from "../../useCommissionRows";
import {
  buildCommissionRateByFactoryOption,
  factoryCommissionRates,
} from "./utils";

/** "Qual fábrica paga a melhor comissão por real vendido." */
export function CommissionRateByFactoryChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { rows, loading, error, refetch } = useCommissionRows(filters);

  const rates = useMemo(() => factoryCommissionRates(rows), [rows]);
  const option = useMemo(
    () => buildCommissionRateByFactoryOption(rates),
    [rates]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={rates.length > 0}
      option={option}
      error={error}
      onRetry={refetch}
    />
  );
}
