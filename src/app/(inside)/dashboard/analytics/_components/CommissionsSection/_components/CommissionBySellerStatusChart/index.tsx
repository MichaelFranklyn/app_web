"use client";

import { useMemo } from "react";

import { ChartFilters } from "../../../../interface";
import { ChartCanvas } from "../../../ChartCanvas";
import { useCommissionRows } from "../../useCommissionRows";
import {
  buildCommissionBySellerStatusOption,
  rankSellerCommissions,
} from "./utils";

/** "Quanto cada vendedor já recebeu e quanto ainda tem para entrar." */
export function CommissionBySellerStatusChart({
  filters,
}: {
  filters: ChartFilters;
}) {
  const { rows, loading, error, refetch } = useCommissionRows(filters);

  const sellers = useMemo(() => rankSellerCommissions(rows), [rows]);
  const option = useMemo(
    () => buildCommissionBySellerStatusOption(sellers),
    [sellers]
  );

  return (
    <ChartCanvas
      loading={loading}
      hasData={sellers.length > 0}
      option={option}
      error={error}
      onRetry={refetch}
    />
  );
}
