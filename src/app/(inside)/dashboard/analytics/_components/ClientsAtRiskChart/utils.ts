import { CHART_INK_MUTED, SERIES_RED } from "@/components/Chart/chartTheme";
import { formatDateDMY } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../../chartBuilders";
import { formatDays } from "../../utils";
import { ClientRiskPoint } from "./interface";

/** Acima do próprio costume = atrasado; ainda dentro dele = só um alerta. */
const LATE_RATIO = 1;

/**
 * Clientes ordenados por quanto passaram do próprio ritmo de compra.
 *
 * A barra são os dias parados, mas a comparação é sempre com o costume do
 * próprio cliente: quem compra a cada 20 dias e sumiu há 60 aparece acima de
 * quem compra a cada 90 e sumiu há 100. Vermelho marca quem já passou do
 * ponto; cinza, quem está no limite.
 */
export const buildClientsAtRiskOption = (
  points: ClientRiskPoint[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    points.map((p) => p.entityName),
    [
      {
        name: "Dias sem comprar",
        color: SERIES_RED,
        data: points.map((p) => p.daysSinceLastOrder),
        // A cor aqui não identifica a série, classifica o cliente.
        itemColors: points.map((p) =>
          p.riskRatio >= LATE_RATIO ? SERIES_RED : CHART_INK_MUTED
        ),
      },
    ],
    formatDays,
    (index) => {
      const point = points[index];
      if (!point) return [];
      return [
        point.entityName,
        `Sem comprar há <b>${formatDays(point.daysSinceLastOrder)}</b>`,
        `Costuma comprar a cada ${formatDays(point.avgIntervalDays)}`,
        mutedLine(`Última compra em ${formatDateDMY(point.lastOrderDate)}`),
      ];
    }
  );
