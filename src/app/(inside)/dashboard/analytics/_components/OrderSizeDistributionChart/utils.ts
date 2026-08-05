import { SERIES_PURPLE } from "@/components/Chart/chartTheme";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildVerticalBarOption, mutedLine } from "../../../chartBuilders";
import { formatCount, formatPercent } from "../../utils";
import { OrderSizeBandPoint } from "./interface";

/**
 * Quantos pedidos caíram em cada faixa de valor.
 *
 * A barra é a QUANTIDADE de pedidos e o tooltip traz o dinheiro daquela faixa —
 * as duas leituras juntas mostram o desequilíbrio típico: a faixa com mais
 * pedidos raramente é a que responde pelo faturamento, e é essa distância que
 * explica de que a venda depende.
 */
export const buildOrderSizeDistributionOption = (
  bands: OrderSizeBandPoint[]
): EChartsCoreOption =>
  buildVerticalBarOption(
    bands.map((band) => band.label),
    {
      name: "Pedidos",
      color: SERIES_PURPLE,
      data: bands.map((band) => band.orderCount),
    },
    formatNumber,
    (index) => {
      const band = bands[index];
      if (!band) return [];
      return [
        band.label,
        `<b>${formatCount(band.orderCount, "pedido", "pedidos")}</b> — ${formatPercent(band.share)} do total`,
        mutedLine(
          `Faturamento da faixa: ${formatMoney(Number(band.totalAmount))}`
        ),
      ];
    }
  );

/** True quando alguma faixa teve pedido — o backend devolve as cinco sempre,
 * então "tem dado" não é "tem linha". */
export const hasOrderSizeData = (bands: OrderSizeBandPoint[]): boolean =>
  bands.some((band) => band.orderCount > 0);
