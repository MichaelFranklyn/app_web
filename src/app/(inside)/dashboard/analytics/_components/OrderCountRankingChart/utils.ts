import type { EChartsCoreOption } from "echarts/core";

import { formatNumber } from "@/utils/format/masks";

import { buildHorizontalBarOption } from "../../../chartBuilders";
import { formatCount } from "../../utils";
import { OrderCountPoint } from "./interface";

/**
 * Ranking do nº de pedidos por entidade, em barras horizontais (nomes de
 * cliente/vendedor não cabem deitados no eixo X). O backend já devolve os
 * maiores primeiro, e o builder põe o primeiro no topo.
 *
 * Volume não é o mesmo que faturamento: quem aparece grande aqui vende MAIS
 * VEZES, não necessariamente mais dinheiro — a comparação entre este gráfico e
 * o de faturamento é justamente o que revela venda de reposição × de campanha.
 */
export const buildOrderCountRankingOption = (
  points: OrderCountPoint[],
  color: string
): EChartsCoreOption =>
  buildHorizontalBarOption(
    points.map((point) => point.entityName),
    [
      {
        name: "Pedidos",
        color,
        data: points.map((point) => point.orderCount),
      },
    ],
    formatNumber,
    (index) => {
      const point = points[index];
      if (!point) return [];
      return [
        point.entityName,
        `<b>${formatCount(point.orderCount, "pedido", "pedidos")}</b>`,
      ];
    }
  );
