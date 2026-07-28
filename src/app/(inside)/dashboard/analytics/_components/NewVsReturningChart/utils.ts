import { SERIES_BLUE, SERIES_GREEN } from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";

import { buildStackedBarOption } from "../../chartBuilders";
import { monthKeyToLabel } from "../../utils";
import { NewVsReturningPoint } from "./interface";

/**
 * Clientes que compraram no mês, empilhados em quem chegou agora e quem
 * voltou. A altura da barra é a base ativa do mês; a fatia azul é o
 * crescimento. Base que só cresce por cliente novo (verde fino) é sinal de
 * que a carteira antiga está escapando.
 */
export const buildNewVsReturningOption = (
  points: NewVsReturningPoint[]
): EChartsCoreOption =>
  buildStackedBarOption(
    points.map((p) => monthKeyToLabel(p.month)),
    [
      {
        name: "Compraram de novo",
        color: SERIES_GREEN,
        data: points.map((p) => p.returningClients),
      },
      {
        name: "Primeira compra",
        color: SERIES_BLUE,
        data: points.map((p) => p.newClients),
      },
    ]
  );
