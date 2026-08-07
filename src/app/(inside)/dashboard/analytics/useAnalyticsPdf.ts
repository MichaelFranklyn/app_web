"use client";

import { useToast } from "@/components/Toast";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  AnalyticsPrintContextValue,
  ChartPrintEntry,
  KpiPrintEntry,
} from "./analyticsPrintContext";
import { exportAnalyticsPdf, PdfMeta } from "./pdfExport";
import { PrintSelection, selectedEntries } from "./printSelection";

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
 * gráficos ESCOLHIDOS renderizarem (com animação concluída) e gera o PDF. Avisa
 * se não há nenhum gráfico com dados no período.
 *
 * O registro é a fonte do seletor de impressão: cada `LazyChartCard` se anuncia
 * ao montar (o card monta sempre; só o gráfico de dentro é lazy), então a lista
 * de partes e gráficos está completa antes de qualquer scroll.
 */
export function useAnalyticsPdf() {
  const { toast } = useToast();
  const [forceRender, setForceRender] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  /**
   * Os gráficos da página, na ordem visual, no momento da chamada.
   *
   * Fotografia, e não estado reativo: quem pergunta é o seletor, ao abrir. Manter
   * isto em estado faria a página re-renderizar a cada card que se registra —
   * trinta re-renders na carga — para uma lista que só é lida sob demanda.
   */
  const listCharts = useCallback((): ChartPrintEntry[] => {
    return Array.from(chartsRef.current.values()).sort(
      (a, b) => a.getTop() - b.getTop()
    );
  }, []);

  const downloadPdf = useCallback(
    async (meta: PdfMeta, selection?: PrintSelection) => {
      setIsExporting(true);
      setForceRender(true);
      try {
        const all = listCharts();
        // Sem seleção (chamada direta), sai a página inteira — que é o que este
        // hook sempre fez antes de existir o seletor.
        const entries = selection ? selectedEntries(all, selection) : all;
        const kpis = selection?.includeKpis === false ? [] : kpisRef.current;

        await waitForCharts(entries);
        await delay(200); // respiro extra p/ o último frame
        const included = await exportAnalyticsPdf(entries, kpis, meta);
        if (included === 0) {
          toast({
            variant: "warning",
            title: "Nada para exportar",
            description:
              "Os gráficos ainda não carregaram ou não há dados no período. Tente novamente em instantes.",
          });
        } else if (included < entries.length) {
          // Gráfico sem dados no período não gera imagem e é pulado. Quem
          // escolheu um por um precisa saber que ele não está no papel — em
          // silêncio, o PDF passaria por "está tudo aqui".
          const missing = entries.length - included;
          toast({
            variant: "warning",
            title: `${missing} gráfico(s) ficaram de fora`,
            description:
              "Eles não têm dados no período escolhido. Os demais estão no PDF.",
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
        setIsExporting(false);
      }
    },
    [toast, listCharts]
  );

  return { contextValue, downloadPdf, isExporting, listCharts };
}
