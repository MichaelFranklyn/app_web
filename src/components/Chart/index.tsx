"use client";

import { useEffect, useRef } from "react";

import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import type { EChartsCoreOption } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

// Registra só o necessário (tree-shaking): barras, linhas, grid, tooltip, legenda.
echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface ChartProps {
  option: EChartsCoreOption;
  /** Altura do canvas em px (default 300). */
  height?: number;
  className?: string;
}

/**
 * Wrapper fino sobre echarts/core. Instancia no mount, reaplica `option` quando
 * muda (notMerge para refletir dados novos), redimensiona via ResizeObserver e
 * descarta a instância no unmount. Client-only (usa DOM).
 */
export default function Chart({ option, height = 300, className }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = echarts.init(el, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(el);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  return <div ref={containerRef} className={className} style={{ height }} />;
}
