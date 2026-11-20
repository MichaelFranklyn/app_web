import {
  SERIES_BLUE,
  SERIES_CYAN,
  SERIES_GREEN,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildStackedBarOption } from "../../../../../chartBuilders";
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
 * Uma barra por mês, empilhando o que já entrou, o que a fábrica ainda deve e
 * o que depende do cliente pagar. Barra (e não linha) porque são partes de um
 * mesmo total: a altura é a comissão do mês e as cores mostram em que degrau
 * ela está. Linhas suavizadas inventavam vales entre meses e a série zerada
 * escondia as outras.
 */
export const buildCommissionsByMonthOption = (
  buckets: CommissionMonthlyBucket[]
): EChartsCoreOption =>
  buildStackedBarOption(
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
