import { SERIES_BLUE, SERIES_ORANGE } from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildBarLineOption } from "../../../chartBuilders";
import { formatPercent } from "../../utils";
import { RevenueSharePoint } from "./interface";

/** Nomes longos de cliente não cabem no eixo: corta e deixa o tooltip completar. */
const shortLabel = (name: string): string =>
  name.length > 18 ? `${name.slice(0, 17)}…` : name;

/**
 * Curva ABC: barra com o faturamento de cada cliente e linha com o acumulado.
 * A pergunta que ela responde é de risco, não de volume — se a linha chega
 * perto de 100% nos primeiros clientes, a empresa depende de poucos, e perder
 * um deles dói.
 */
export const buildConcentrationOption = (
  points: RevenueSharePoint[]
): EChartsCoreOption =>
  buildBarLineOption(
    points.map((p) => shortLabel(p.entityName)),
    {
      name: "Faturamento",
      color: SERIES_BLUE,
      data: points.map((p) => Number(p.total)),
      formatter: formatMoney,
    },
    {
      name: "Acumulado",
      color: SERIES_ORANGE,
      data: points.map((p) => p.cumulativeShare),
      formatter: formatPercent,
    },
    { lineMax: 1 }
  );
