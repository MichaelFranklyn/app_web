import { CHART_PALETTE } from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildMonthLinesOption } from "../../../../../chartBuilders";
import { monthKeyToLabel } from "../../../../utils";
import { ScopedCommissionRow } from "../../interface";
import { commissionMonths, commissionTotalsBy } from "../../utils";

export interface SellerMonthSeries {
  sellerId: string;
  sellerName: string;
  /** Comissão do vendedor em cada mês, alinhada com `months`. */
  values: number[];
}

export interface SellerMonthPivot {
  months: string[];
  series: SellerMonthSeries[];
}

/**
 * Vira as linhas em uma série contínua por vendedor.
 *
 * Todo mês do período que tem comissão de alguém entra no eixo, e cada vendedor
 * recebe um valor para cada um deles — zero no mês em que não ganhou nada. Sem
 * esse preenchimento a linha ligaria dois meses não vizinhos e sugeriria uma
 * continuidade que não existiu.
 *
 * O valor é a comissão do mês somando as três situações (recebido, a receber e
 * previsto): a pergunta é "quanto esse vendedor ganha nesse mês", e para ele
 * tanto faz em que degrau do repasse o dinheiro está.
 */
export const pivotCommissionBySellerMonth = (
  rows: ScopedCommissionRow[],
  limit = 6
): SellerMonthPivot => {
  const months = commissionMonths(rows);
  const monthIndex = new Map(months.map((month, index) => [month, index]));

  // Ordena por comissão do período: a legenda passa a ser a ordem de
  // importância e as cores ficam estáveis entre recargas.
  const ranked = commissionTotalsBy(rows, "seller").slice(0, limit);
  const byId = new Map(
    ranked.map((seller) => [
      seller.id,
      {
        sellerId: seller.id,
        sellerName: seller.name,
        values: Array(months.length).fill(0) as number[],
      },
    ])
  );

  for (const row of rows) {
    const serie = byId.get(row.sellerId);
    if (!serie) continue; // vendedor fora do top N
    serie.values[monthIndex.get(row.month) ?? 0] += row.amount;
  }

  return { months, series: [...byId.values()] };
};

/**
 * Uma linha por vendedor ao longo dos meses. É o gráfico que responde "quanto
 * cada um ganhou/vai ganhar em cada mês" — o total da empresa esconde
 * exatamente isso, e o ranking do período esconde quem está subindo.
 */
export const buildCommissionBySellerMonthOption = ({
  months,
  series,
}: SellerMonthPivot): EChartsCoreOption =>
  buildMonthLinesOption(
    months.map(monthKeyToLabel),
    series.map((serie, index) => ({
      name: serie.sellerName,
      color: CHART_PALETTE[index % CHART_PALETTE.length],
      data: serie.values,
    })),
    formatMoney
  );
