import {
  SERIES_BLUE,
  baseGrid,
  categoryAxis,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";
import { PortalMonthTotal } from "../../interface";
import { monthShortLabel } from "../../utils";

/**
 * Barras por mês — uma série só, uma cor só.
 *
 * Empilhar as fábricas aqui seria possível e é o que um painel interno faria,
 * mas quem lê é o dono da loja: a pergunta é "quanto eu comprei em cada mês",
 * e uma barra por mês responde sem precisar de legenda.
 */
export const buildMonthlyChartOption = (
  months: PortalMonthTotal[]
): EChartsCoreOption => ({
  grid: baseGrid,
  tooltip: {
    ...tooltipBase,
    valueFormatter: (value: unknown) => formatMoney(Number(value)),
  },
  xAxis: {
    ...categoryAxis,
    data: months.map((m) => monthShortLabel(m.month)),
  },
  yAxis: {
    ...valueAxis,
    axisLabel: {
      ...valueAxis.axisLabel,
      // Sem os centavos e sem o "R$": o eixo é régua, não extrato. Com o valor
      // cheio, seis rótulos de moeda ocupam metade da largura no celular.
      formatter: (value: number) =>
        value >= 1000 ? `${Math.round(value / 1000)}k` : String(value),
    },
  },
  series: [
    {
      type: "bar",
      data: months.map((m) => Number(m.amount)),
      itemStyle: { color: SERIES_BLUE, borderRadius: [4, 4, 0, 0] },
      barMaxWidth: 40,
    },
  ],
});
