import {
  CHART_INK_MUTED,
  SERIES_BLUE,
  SERIES_ORANGE,
} from "@/components/Chart/chartTheme";
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
  muteOthersBar(
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
    ),
    points
  );

/**
 * A barra "Outros clientes" soma o resto da carteira e costuma ser a maior do
 * gráfico: na cor da série, ela parecia um cliente gigante e quebrava a leitura
 * do maior para o menor. Fica cinza clara — é o resto, não um concorrente dos
 * dez primeiros. O acumulado (a linha) continua chegando a 100% nela.
 */
const muteOthersBar = (
  option: EChartsCoreOption,
  points: RevenueSharePoint[]
): EChartsCoreOption => {
  const [bar, ...rest] = (option.series ?? []) as {
    data: number[];
  }[];
  if (!bar) return option;
  return {
    ...option,
    series: [
      {
        ...bar,
        data: bar.data.map((value, index) =>
          points[index]?.entityId === null
            ? { value, itemStyle: { color: CHART_INK_MUTED, opacity: 0.35 } }
            : value
        ),
      },
      ...rest,
    ],
  };
};
