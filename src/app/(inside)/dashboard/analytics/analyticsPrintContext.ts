"use client";

import { createContext, useContext } from "react";

/** Um gráfico registrado para entrar no PDF da página. */
export interface ChartPrintEntry {
  id: string;
  title: string;
  /** dataURL PNG da instância ECharts, ou null se ainda não montou. */
  getImage: () => string | null;
  /** Posição vertical do card (para ordenar os gráficos no PDF). */
  getTop: () => number;
}

/** Bignumber (KPI) do topo, incluído no cabeçalho do PDF. */
export interface KpiPrintEntry {
  label: string;
  value: string;
}

export interface AnalyticsPrintContextValue {
  /** Quando true, os cards lazy montam mesmo fora da viewport (p/ o PDF). */
  forceRender: boolean;
  registerChart: (entry: ChartPrintEntry) => void;
  unregisterChart: (id: string) => void;
  setKpis: (kpis: KpiPrintEntry[]) => void;
}

const noop = () => {};

export const AnalyticsPrintContext = createContext<AnalyticsPrintContextValue>({
  forceRender: false,
  registerChart: noop,
  unregisterChart: noop,
  setKpis: noop,
});

export const useAnalyticsPrint = () => useContext(AnalyticsPrintContext);
