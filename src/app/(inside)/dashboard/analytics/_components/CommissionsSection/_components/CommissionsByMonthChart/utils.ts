import {
  SERIES_BLUE,
  SERIES_CYAN,
  SERIES_GREEN,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildMonthLinesOption } from "../../../../../chartBuilders";
import { monthKeyToLabel } from "../../../../utils";
import { ScopedCommissionRow } from "../../interface";
import { commissionMonths } from "../../utils";

export interface CommissionMonthlyBucket {
  month: string; // "YYYY-MM"
  received: number;
  receivable: number;
  pending: number;
}

/**
 * Soma a comissão de cada mês separando as três situações. Meses sem nenhuma
 * das três não aparecem; dentro do intervalo, um mês só entra se houve linha —
 * o que evita desenhar zero onde a fábrica simplesmente não paga naquele mês.
 */
export const bucketCommissionsByMonth = (
  rows: ScopedCommissionRow[]
): CommissionMonthlyBucket[] => {
  const byMonth = new Map<string, CommissionMonthlyBucket>();

  for (const month of commissionMonths(rows)) {
    byMonth.set(month, { month, received: 0, receivable: 0, pending: 0 });
  }

  for (const row of rows) {
    const bucket = byMonth.get(row.month);
    if (bucket) bucket[row.status] += row.amount;
  }

  return [...byMonth.values()];
};

/**
 * Três linhas por mês: o que já entrou, o que a fábrica ainda deve e o que
 * depende do cliente pagar. Separadas (e não somadas numa linha só) porque a
 * distância entre elas é a informação: previsto virando a receber e a receber
 * virando recebido é o caminho normal — travar em algum degrau é o problema.
 */
export const buildCommissionsByMonthOption = (
  buckets: CommissionMonthlyBucket[]
): EChartsCoreOption =>
  buildMonthLinesOption(
    buckets.map((bucket) => monthKeyToLabel(bucket.month)),
    [
      {
        name: "Recebido",
        color: SERIES_GREEN,
        data: buckets.map((bucket) => bucket.received),
      },
      {
        name: "A receber",
        color: SERIES_BLUE,
        data: buckets.map((bucket) => bucket.receivable),
      },
      {
        name: "Previsto",
        color: SERIES_CYAN,
        data: buckets.map((bucket) => bucket.pending),
      },
    ],
    formatMoney
  );
