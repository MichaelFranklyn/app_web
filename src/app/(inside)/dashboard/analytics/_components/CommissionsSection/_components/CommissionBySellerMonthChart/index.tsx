"use client";

import { useMemo } from "react";

import { ChartFilters } from "../../../../interface";
import { ChartCanvas } from "../../../ChartCanvas";
import { useCommissionRows } from "../../useCommissionRows";
import {
  buildCommissionBySellerMonthOption,
  pivotCommissionBySellerMonth,
} from "./utils";

/** "Quanto cada vendedor ganhou (e vai ganhar) de comissão em cada mês." */
export function CommissionBySellerMonthChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { rows, loading, error, refetch } = useCommissionRows(filters);

  const pivot = useMemo(() => pivotCommissionBySellerMonth(rows), [rows]);
  const option = useMemo(
    () => buildCommissionBySellerMonthOption(pivot),
    [pivot]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={pivot.series.length > 0}
      option={option}
      error={error}
      onRetry={refetch}
    />
  );
}
