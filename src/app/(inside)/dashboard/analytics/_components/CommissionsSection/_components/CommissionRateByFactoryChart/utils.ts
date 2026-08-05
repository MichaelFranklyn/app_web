import { SERIES_PURPLE } from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import {
  buildHorizontalBarOption,
  mutedLine,
} from "../../../../../chartBuilders";
import { ScopedCommissionRow } from "../../interface";
import { commissionTotalsBy } from "../../utils";

export interface FactoryCommissionRate {
  factoryId: string;
  name: string;
  /** Comissão ÷ valor faturado, em fração (0,045 = 4,5%). */
  rate: number;
  commission: number;
  invoiced: number;
}

/**
 * Taxa efetiva de comissão de cada fábrica: quanto sobrou de comissão por real
 * faturado nas parcelas do período.
 *
 * É "efetiva" e não a taxa cadastrada porque sai do que realmente foi faturado
 * — mistura de níveis de preço, IPI fora da base e pedidos faturados parcial
 * fazem o número real ficar diferente do combinado no vínculo.
 *
 * Fábrica sem valor faturado no período fica fora: dividir por zero não gera
 * taxa, gera ruído.
 */
export const factoryCommissionRates = (
  rows: ScopedCommissionRow[],
  limit = 10
): FactoryCommissionRate[] =>
  commissionTotalsBy(rows, "factory")
    .filter((factory) => factory.base > 0)
    .map((factory) => ({
      factoryId: factory.id,
      name: factory.name,
      rate: factory.total / factory.base,
      commission: factory.total,
      invoiced: factory.base,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit);

/** Fração → "4,5%". Uma casa decimal: em comissão, 0,5% já é dinheiro. */
export const formatRate = (value: number): string =>
  `${(value * 100).toFixed(1).replace(".", ",")}%`;

/**
 * Ranking das fábricas pela taxa efetiva. Ao lado do ranking por valor, mostra
 * a diferença entre a fábrica que dá muita comissão porque vende muito e a que
 * paga bem por real vendido.
 */
export const buildCommissionRateByFactoryOption = (
  rates: FactoryCommissionRate[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    rates.map((rate) => rate.name),
    [
      {
        name: "Taxa efetiva",
        color: SERIES_PURPLE,
        data: rates.map((rate) => rate.rate),
      },
    ],
    formatRate,
    (index) => {
      const rate = rates[index];
      if (!rate) return [];
      return [
        rate.name,
        `Taxa efetiva: <b>${formatRate(rate.rate)}</b>`,
        mutedLine(
          `${formatMoney(rate.commission)} de comissão sobre ${formatMoney(rate.invoiced)} faturados`
        ),
      ];
    }
  );
