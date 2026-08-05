import {
  SERIES_BLUE,
  SERIES_CYAN,
  SERIES_GREEN,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import {
  buildHorizontalBarOption,
  mutedLine,
} from "../../../../../chartBuilders";
import { CommissionEntityTotals, ScopedCommissionRow } from "../../interface";
import { commissionTotalsBy } from "../../utils";

/** Vendedores com mais comissão no período, do maior para o menor. */
export const rankSellerCommissions = (
  rows: ScopedCommissionRow[],
  limit = 8
): CommissionEntityTotals[] =>
  commissionTotalsBy(rows, "seller").slice(0, limit);

/**
 * Uma barra por vendedor, dividida em recebido / a receber / previsto.
 *
 * Empilhada de propósito: a barra inteira é o quanto ele ganha no período e as
 * partes dizem em que pé está cada pedaço. Assim o mesmo desenho responde
 * "quem ganhou mais" e "quanto disso ainda não caiu na conta".
 */
export const buildCommissionBySellerStatusOption = (
  sellers: CommissionEntityTotals[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    sellers.map((seller) => seller.name),
    [
      {
        name: "Recebido",
        color: SERIES_GREEN,
        data: sellers.map((seller) => seller.received),
      },
      {
        name: "A receber",
        color: SERIES_BLUE,
        data: sellers.map((seller) => seller.receivable),
      },
      {
        name: "Previsto",
        color: SERIES_CYAN,
        data: sellers.map((seller) => seller.pending),
      },
    ],
    formatMoney,
    (index) => {
      const seller = sellers[index];
      if (!seller) return [];
      return [
        seller.name,
        `Total no período: <b>${formatMoney(seller.total)}</b>`,
        mutedLine(`Recebido: ${formatMoney(seller.received)}`),
        mutedLine(`A receber: ${formatMoney(seller.receivable)}`),
        mutedLine(`Previsto: ${formatMoney(seller.pending)}`),
      ];
    },
    { stacked: true }
  );
