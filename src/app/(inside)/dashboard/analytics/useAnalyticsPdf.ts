"use client";

import { useToast } from "@/components/Toast";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  AnalyticsPrintContextValue,
  ChartPrintEntry,
  KpiPrintEntry,
} from "./analyticsPrintContext";
import { exportAnalyticsPdf, PdfMeta } from "./pdfExport";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Espera os gráficos renderizarem. Resolve quando o nº de gráficos prontos
 * (imagem disponível) fica estável por `settleMs` — o que também dá tempo da
 * animação de entrada do echarts (~1s) terminar antes da captura. Não trava o
 * tempo todo por causa de um gráfico sem dados; `timeout` é a rede de segurança.
 */
const waitForCharts = (
  entries: ChartPrintEntry[],
  { settleMs = 1100, emptyMs = 4000, timeout = 15000 } = {}
) =>
  new Promise<void>((resolve) => {
    if (entries.length === 0) return resolve();
    const start = Date.now();
    let lastReady = -1;
    let lastChange = Date.now();

    const check = () => {
      const ready = entries.filter((e) => e.getImage() != null).length;
      const now = Date.now();
      if (ready !== lastReady) {
        lastReady = ready;
        lastChange = now;
      }
      const settled = ready > 0 && now - lastChange >= settleMs;
      // Nada renderizou (período/tenant sem dados): não espera o timeout cheio.
      const emptyStable = ready === 0 && now - start >= emptyMs;
      if (settled || emptyStable || now - start >= timeout) return resolve();
      setTimeout(check, 200);
    };
    check();
  });

/**
 * Orquestra o export de PDF da página: mantém o registro dos gráficos/KPIs e o
 * flag que força os cards lazy a montarem. Ao baixar, monta tudo, espera os
 * gráficos renderizarem (com animação concluída) e gera o PDF. Avisa se não há
 * nenhum gráfico com dados no período.
 */
export function useAnalyticsPdf() {
  const { toast } = useToast();
  const [forceRender, setForceRender] = useState(false);
  const [exporting, setExporting] = useState(false);
  const chartsRef = useRef<Map<string, ChartPrintEntry>>(new Map());
  const kpisRef = useRef<KpiPrintEntry[]>([]);

  const registerChart = useCallback((entry: ChartPrintEntry) => {
    chartsRef.current.set(entry.id, entry);
  }, []);
  const unregisterChart = useCallback((id: string) => {
    chartsRef.current.delete(id);
  }, []);
  const setKpis = useCallback((kpis: KpiPrintEntry[]) => {
    kpisRef.current = kpis;
  }, []);

  const contextValue: AnalyticsPrintContextValue = useMemo(
    () => ({ forceRender, registerChart, unregisterChart, setKpis }),
    [forceRender, registerChart, unregisterChart, setKpis]
  );

  const downloadPdf = useCallback(
    async (meta: PdfMeta) => {
      setExporting(true);
      setForceRender(true);
      try {
        const entries = Array.from(chartsRef.current.values());
        await waitForCharts(entries);
        await delay(200); // respiro extra p/ o último frame
        const included = await exportAnalyticsPdf(
          entries,
          kpisRef.current,
          meta
        );
        if (included === 0) {
          toast({
            variant: "warning",
            title: "Nada para exportar",
            description:
              "Os gráficos ainda não carregaram ou não há dados no período. Tente novamente em instantes.",
          });
        }
      } catch (error) {
        toast({
          variant: "error",
          title: "Erro ao gerar PDF",
          description:
            error instanceof Error ? error.message : "Tente novamente.",
        });
      } finally {
        setForceRender(false);
        setExporting(false);
      }
    },
    [toast]
  );

  return { contextValue, downloadPdf, exporting };
}
