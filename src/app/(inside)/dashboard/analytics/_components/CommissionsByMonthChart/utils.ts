import type { EChartsCoreOption } from "echarts/core";

import {
  baseGrid,
  categoryAxis,
  SERIES_BLUE,
  SERIES_GREEN,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import { monthKeyToLabel } from "../../utils";
import { CommissionChartRow, CommissionMonthlyBucket } from "./interface";

interface BucketFilters {
  from: string;
  to: string;
  sellerId: string | null;
}

/**
 * Agrega parcelas de comissão por mês da `receiveDate`, somando "a receber"
 * (isReceivable) e "recebido" (isReceived) separadamente. Filtra por período e,
 * quando informado, por vendedor (a query `commissions` não aceita esses args).
 * Puro/testável.
 */
export const bucketCommissionsByMonth = (
  rows: CommissionChartRow[],
  { from, to, sellerId }: BucketFilters
): CommissionMonthlyBucket[] => {
  const byMonth = new Map<string, CommissionMonthlyBucket>();

  for (const row of rows) {
    if (!row.receiveDate) continue;
    const date = row.receiveDate.slice(0, 10);
    if (date < from || date > to) continue;
    if (sellerId && row.seller?.id !== sellerId) continue;

    const month = date.slice(0, 7); // "YYYY-MM"
    const bucket = byMonth.get(month) ?? { month, receivable: 0, received: 0 };
    const amount = Number(row.amount) || 0;
    if (row.isReceived) bucket.received += amount;
    else if (row.isReceivable) bucket.receivable += amount;
    byMonth.set(month, bucket);
  }

  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
};

/** Linha dupla (A receber / Recebido) por mês → compara a evolução das duas ao
 * longo do tempo, com legenda. */
export const buildCommissionsOption = (
  buckets: CommissionMonthlyBucket[]
): EChartsCoreOption => ({
  grid: { ...baseGrid, top: 40 },
  legend: {
    top: 0,
    left: 0,
    icon: "roundRect",
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { fontSize: 12 },
  },
  tooltip: {
    ...tooltipBase,
    valueFormatter: (v: unknown) => formatMoney(Number(v)),
  },
  xAxis: {
    ...categoryAxis,
    boundaryGap: false,
    data: buckets.map((b) => monthKeyToLabel(b.month)),
  },
  yAxis: {
    ...valueAxis,
    axisLabel: {
      ...valueAxis.axisLabel,
      formatter: (v: number) => formatMoney(v),
    },
  },
  series: [
    {
      name: "A receber",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 2, color: SERIES_BLUE },
      itemStyle: { color: SERIES_BLUE },
      data: buckets.map((b) => b.receivable),
    },
    {
      name: "Recebido",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 2, color: SERIES_GREEN },
      itemStyle: { color: SERIES_GREEN },
      data: buckets.map((b) => b.received),
    },
  ],
});
