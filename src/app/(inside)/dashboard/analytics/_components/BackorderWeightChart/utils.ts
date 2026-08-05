import { SERIES_BLUE, SERIES_ORANGE } from "@/components/Chart/chartTheme";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildStackedBarOption, mutedLine } from "../../../chartBuilders";
import { formatCount, formatPercent, monthKeyToLabel } from "../../utils";
import { BackorderMonthPoint } from "./interface";

/**
 * Volume do mês dividido entre venda nova e sobra de faturamento parcial.
 *
 * Empilhado porque a barra inteira é o número de pedidos que a lista mostra — e
 * a parte laranja é o quanto desse número não é venda nova, e sim a mesma venda
 * ocupando uma segunda linha porque a fábrica não tinha estoque de tudo.
 *
 * O tooltip carrega a fatia e o dinheiro parado em sobra: a contagem sozinha não
 * distingue "três sobras de R$ 200" de "três sobras de R$ 20 mil", e a segunda é
 * uma conversa com a fábrica.
 */
export const buildBackorderWeightOption = (
  points: BackorderMonthPoint[]
): EChartsCoreOption =>
  buildStackedBarOption(
    points.map((point) => monthKeyToLabel(point.month)),
    [
      {
        name: "Venda nova",
        color: SERIES_BLUE,
        data: points.map((point) => point.newOrders),
      },
      {
        name: "Sobra de faturamento",
        color: SERIES_ORANGE,
        data: points.map((point) => point.backorders),
      },
    ],
    formatNumber,
    (index) => {
      const point = points[index];
      if (!point) return [];
      const total = point.newOrders + point.backorders;
      return [
        monthKeyToLabel(point.month),
        `${formatCount(total, "pedido", "pedidos")} no mês`,
        `Venda nova: <b>${formatNumber(point.newOrders)}</b>`,
        `Sobra de faturamento: <b>${formatNumber(point.backorders)}</b> — ${formatPercent(point.backorderShare)} do mês`,
        mutedLine(
          `Valor em sobras: ${formatMoney(Number(point.backorderAmount))}`
        ),
      ];
    }
  );

/** True quando houve alguma sobra no período — sem nenhuma, o gráfico seria uma
 * barra azul inteira repetindo o "pedidos por mês" que já existe. */
export const hasBackorders = (points: BackorderMonthPoint[]): boolean =>
  points.some((point) => point.backorders > 0);
