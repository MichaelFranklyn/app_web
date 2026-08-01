import { SERIES_CYAN } from "@/components/Chart/chartTheme";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildVerticalBarOption, mutedLine } from "../../chartBuilders";
import { formatCount, formatPercent } from "../../utils";
import { WeekdayVolumePoint } from "./interface";

/**
 * Em que dia da semana o pedido é fechado.
 *
 * Serve para conferir a rotina contra a realidade: se quase todo pedido sai na
 * segunda e na terça, visita marcada para sexta chega depois da decisão de
 * compra. Dia zerado aparece na mesma altura do eixo de propósito — é a
 * ausência que informa.
 */
export const buildOrdersByWeekdayOption = (
  days: WeekdayVolumePoint[]
): EChartsCoreOption =>
  buildVerticalBarOption(
    days.map((day) => day.label),
    {
      name: "Pedidos",
      color: SERIES_CYAN,
      data: days.map((day) => day.orderCount),
    },
    formatNumber,
    (index) => {
      const day = days[index];
      if (!day) return [];
      return [
        day.label,
        `<b>${formatCount(day.orderCount, "pedido", "pedidos")}</b> — ${formatPercent(day.share)} da semana`,
        mutedLine(
          `Faturamento do dia: ${formatMoney(Number(day.totalAmount))}`
        ),
      ];
    }
  );

/** True quando algum dia teve pedido (o backend devolve os sete sempre). */
export const hasWeekdayData = (days: WeekdayVolumePoint[]): boolean =>
  days.some((day) => day.orderCount > 0);
