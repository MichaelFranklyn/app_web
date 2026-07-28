import { SERIES_PURPLE } from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatPercent } from "../../utils";
import { WalletCoveragePoint } from "./interface";

/**
 * Fatia da carteira de cada vendedor que comprou no período.
 *
 * A barra é a porcentagem, mas o tooltip mostra os números absolutos porque
 * são eles que dão o tamanho do problema: 50% de 4 clientes e 50% de 80 pedem
 * conversas muito diferentes.
 */
export const buildWalletCoverageOption = (
  points: WalletCoveragePoint[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    points.map((p) => p.entityName),
    [
      {
        name: "Cobertura",
        color: SERIES_PURPLE,
        data: points.map((p) => p.coverageRate),
      },
    ],
    formatPercent,
    (index) => {
      const point = points[index];
      if (!point) return [];
      return [
        point.entityName,
        `Compraram no período: <b>${formatPercent(point.coverageRate)}</b>`,
        mutedLine(
          `${point.activeClients} de ${point.walletClients} clientes da carteira`
        ),
      ];
    }
  );
