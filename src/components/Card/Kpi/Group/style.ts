import type { GridBreakpointCols } from "@/components/Grid/Root/interface";

/**
 * As colunas da faixa saem da QUANTIDADE de cartões — nunca de cada tela
 * (padrão de KPIs, 23/11/2026). Antes cada faixa escolhia as suas: 2×2 até
 * 1600px numas, 4 já no desktop noutras, 3 no celular, 1 no celular…
 *
 * - Celular: sempre 2 por linha (o rótulo precisa de meia tela).
 * - Tablet: até 3 numa linha; 4 viram 2×2.
 * - Desktop: a fileira inteira numa linha até 5; 6 viram 3×2; 7+ vão de 4 em 4.
 */
export function kpiGroupCols(count: number): GridBreakpointCols {
  if (count <= 1) return { base: 1 };
  if (count === 2) return { base: 2 };
  if (count === 3) return { base: 2, tablet: 3 };
  if (count === 4) return { base: 2, desktop: 4 };
  if (count === 5) return { base: 2, tablet: 3, desktop: 5 };
  if (count === 6) return { base: 2, tablet: 3 };
  return { base: 2, tablet: 3, desktop: 4 };
}

/**
 * Quantidade ímpar: o último cartão ocupa a linha toda no celular, para a
 * fileira não terminar com meia linha em branco
 * (feedback_no_empty_row_space_mobile).
 */
export const KPI_GROUP_LAST_ODD_SPAN: GridBreakpointCols = {
  base: 2,
  tablet: 1,
};
