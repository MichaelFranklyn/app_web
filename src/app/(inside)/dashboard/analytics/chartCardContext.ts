"use client";

import type { EChartsCoreOption } from "echarts/core";
import { createContext, useContext } from "react";

import type { ChartInstance } from "@/components/Chart";
import { ChartPrefs, DEFAULT_CHART_PREFS } from "./chartCustomize";

/**
 * Ponte entre o card do gráfico (LazyChartCard, que tem o menu de ações) e o
 * ChartCanvas (que todo gráfico usa por dentro). O card provê; o canvas registra
 * a option atual e a instância ECharts, e lê as preferências de exibição.
 */
export interface ChartCardContextValue {
  prefs: ChartPrefs;
  registerOption: (option: EChartsCoreOption | null) => void;
  registerInstance: (instance: ChartInstance | null) => void;
}

const noop = () => {};

export const ChartCardContext = createContext<ChartCardContextValue>({
  prefs: DEFAULT_CHART_PREFS,
  registerOption: noop,
  registerInstance: noop,
});

export const useChartCard = () => useContext(ChartCardContext);
