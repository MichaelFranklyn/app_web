import { SERIES_ORANGE } from "@/components/Chart/chartTheme";
import { formatNumber } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatCount } from "../../utils";
import { ItemsPerOrderPoint } from "./interface";

/** "3,4" — média com uma casa, que é a precisão que a leitura suporta. */
export const formatItems = (value: number): string =>
  value.toFixed(1).replace(".", ",");

/**
 * Quantos itens diferentes tem o pedido médio de cada fábrica.
 *
 * É a profundidade do mix, e não o tamanho em dinheiro: pedido de dois itens é
 * reposição do que já vende; de vinte, coleção comprada. Duas fábricas com o
 * mesmo ticket médio podem ser vendas completamente diferentes — a barra mostra
 * os itens e o tooltip traz as peças, porque item caro em pouca quantidade e
 * item barato em muita quantidade dão o mesmo ticket.
 */
export const buildItemsPerOrderOption = (
  points: ItemsPerOrderPoint[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    points.map((point) => point.entityName),
    [
      {
        name: "Itens por pedido",
        color: SERIES_ORANGE,
        data: points.map((point) => point.avgItems),
      },
    ],
    formatItems,
    (index) => {
      const point = points[index];
      if (!point) return [];
      return [
        point.entityName,
        `<b>${formatItems(point.avgItems)} itens</b> por pedido`,
        mutedLine(
          `${formatNumber(Math.round(point.avgUnits))} peças por pedido · ${formatCount(point.orderCount, "pedido", "pedidos")} no período`
        ),
      ];
    }
  );
