import { SERIES_ORANGE } from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../../../chartBuilders";
import { CommissionEntityTotals, ScopedCommissionRow } from "../../interface";
import { commissionTotalsBy } from "../../utils";

/** Fábricas que mais geraram comissão no período, da maior para a menor. */
export const rankFactoryCommissions = (
  rows: ScopedCommissionRow[],
  limit = 10
): CommissionEntityTotals[] =>
  commissionTotalsBy(rows, "factory").slice(0, limit);

/**
 * Ranking das fábricas pela comissão do período. Responde de onde vem o dinheiro
 * do representante — que não é a mesma pergunta de quem fatura mais: fábrica com
 * faturamento alto e comissão baixa aparece grande no gráfico de faturamento e
 * pequena aqui.
 */
export const buildCommissionByFactoryOption = (
  factories: CommissionEntityTotals[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    factories.map((factory) => factory.name),
    [
      {
        name: "Comissão",
        color: SERIES_ORANGE,
        data: factories.map((factory) => factory.total),
      },
    ],
    formatMoney,
    (index) => {
      const factory = factories[index];
      if (!factory) return [];
      return [
        factory.name,
        `Comissão no período: <b>${formatMoney(factory.total)}</b>`,
        mutedLine(
          `Recebido: ${formatMoney(factory.received)} · A receber: ${formatMoney(factory.receivable)}`
        ),
      ];
    }
  );
