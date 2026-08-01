"use client";

import { useMemo } from "react";

import { ChartFilters } from "../../../../interface";
import { ChartCanvas } from "../../../ChartCanvas";
import { useCommissionRows } from "../../useCommissionRows";
import {
  bucketCommissionsByMonth,
  buildCommissionsByMonthOption,
} from "./utils";

/** "Quanto de comissão cai em cada mês e quanto disso já entrou." */
export function CommissionsByMonthChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { rows, loading, error, refetch } = useCommissionRows(filters);

  const buckets = useMemo(() => bucketCommissionsByMonth(rows), [rows]);
  const option = useMemo(
    () => buildCommissionsByMonthOption(buckets),
    [buckets]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={buckets.length > 0}
      option={option}
      error={error}
      onRetry={refetch}
    />
  );
}
