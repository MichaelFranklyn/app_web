"use client";

import { Card } from "@/components/Card";
import type { ChartInstance } from "@/components/Chart";
import { CHART_SURFACE } from "@/components/Chart/chartTheme";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { useInView } from "@/hooks/useInView";
import { downloadCSV } from "@/utils/format/csv";
import type { EChartsCoreOption } from "echarts/core";
import dynamic from "next/dynamic";
import {
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAnalyticsPrint } from "../../analyticsPrintContext";
import { ChartCardContext } from "../../chartCardContext";
import {
  chartCapabilities,
  chartFilename,
  ChartPrefs,
  customizeChart,
  DEFAULT_CHART_PREFS,
  defaultShowLegend,
  optionToRows,
} from "../../chartCustomize";
import { buildChartInsight } from "../../chartInsight";
import { ChartHelp } from "../../interface";
import { ChartHelpTip } from "../ChartHelpTip";
import { ChartMenu } from "../ChartMenu";

const EMPTY_CAPS = {
  hasLegend: false,
  hasAxes: false,
  variants: [] as string[],
};

// Mesmo chunk assíncrono do ChartCanvas (echarts sob demanda), aqui p/ o modal.
const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[560px] w-full" />,
});

interface Props {
  title: string;
  description?: string;
  /** Explicação do gráfico, no "?" ao lado do título (ver chartHelp.ts). */
  help?: ChartHelp;
  children: ReactNode;
}

/**
 * Card de gráfico com lazy-load por scroll e menu de personalização (três
 * pontos): rótulos, legenda e grade (os aplicáveis), expandir num modal maior e
 * baixar imagem/dados. O menu conversa com o gráfico interno via
 * ChartCardContext — o gráfico em si não precisa saber de nada disso.
 */
export function LazyChartCard({ title, description, help, children }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true });
  const print = useAnalyticsPrint();
  const id = useId();
  const [prefs, setPrefs] = useState<ChartPrefs>(DEFAULT_CHART_PREFS);
  const [expanded, setExpanded] = useState(false);
  const [option, setOption] = useState<EChartsCoreOption | null>(null);
  const [instance, setInstance] = useState<ChartInstance | null>(null);
  // Espelha a instância em ref p/ o PDF ler o valor atual sem re-registrar.
  const instanceRef = useRef<ChartInstance | null>(null);

  const registerInstance = useCallback((inst: ChartInstance | null) => {
    instanceRef.current = inst;
    setInstance(inst);
  }, []);

  const ctx = useMemo(
    () => ({
      prefs,
      registerOption: setOption,
      registerInstance,
    }),
    [prefs, registerInstance]
  );

  // Registra este gráfico para o export de PDF da página inteira.
  useEffect(() => {
    print.registerChart({
      id,
      title,
      // JPEG (não PNG) para o PDF não ficar pesado demais com vários gráficos.
      getImage: () =>
        instanceRef.current?.getDataURL({
          type: "jpeg",
          pixelRatio: 2,
          backgroundColor: CHART_SURFACE,
        }) ?? null,
      getTop: () => ref.current?.getBoundingClientRect().top ?? 0,
    });
    return () => print.unregisterChart(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, title]);

  const hasChart = option !== null;
  const capabilities = useMemo(
    () => (option ? chartCapabilities(option) : EMPTY_CAPS),
    [option]
  );

  // Ajusta o default de legenda uma vez, quando o 1º gráfico monta (série única
  // começa sem legenda; multi-série/rosca/comissões começam com).
  const legendInited = useRef(false);
  useEffect(() => {
    if (!option || legendInited.current) return;
    legendInited.current = true;
    setPrefs((p) => ({ ...p, showLegend: defaultShowLegend(option) }));
  }, [option]);

  const togglePref = (key: "showLabel" | "showLegend" | "showGrid") =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const selectVariant = (index: number) =>
    setPrefs((p) => ({ ...p, variant: index }));

  const handleDownloadImage = () => {
    if (!instance) return;
    const url = instance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: CHART_SURFACE,
    });
    const link = document.createElement("a");
    link.href = url;
    link.download = `${chartFilename(title)}.png`;
    link.click();
  };

  const handleDownloadCsv = () => {
    if (!option) return;
    const rows = optionToRows(option);
    if (rows.length === 0) return;
    downloadCSV(`${chartFilename(title)}.csv`, rows);
  };

  const expandedOption = useMemo(
    () => (option ? customizeChart(option, prefs) : null),
    [option, prefs]
  );

  // Lê os números do gráfico já montado: a análise acompanha o filtro de
  // período/vendedor sem precisar de query própria.
  const insight = useMemo(
    () =>
      option && help?.insight ? buildChartInsight(option, help.insight) : null,
    [option, help]
  );

  return (
    <ChartCardContext.Provider value={ctx}>
      <Card.Root>
        <Card.Header>
          {/* Título e "?" na mesma linha: a explicação é do gráfico, não do
              card — longe do título ela vira mais um botão sem dono. */}
          <div className="flex min-w-0 items-center gap-4">
            <Card.Header.Title size="sm" weight="semibold" className="min-w-0">
              {title}
            </Card.Header.Title>
            {help && (
              <ChartHelpTip title={title} help={help} insight={insight} />
            )}
          </div>
          {description && (
            <Card.Header.Description>{description}</Card.Header.Description>
          )}
          <Card.Header.Actions>
            <ChartMenu
              prefs={prefs}
              capabilities={capabilities}
              disabled={!hasChart}
              onToggle={togglePref}
              onSelectVariant={selectVariant}
              onExpand={() => setExpanded(true)}
              onDownloadImage={handleDownloadImage}
              onDownloadCsv={handleDownloadCsv}
            />
          </Card.Header.Actions>
        </Card.Header>
        <Card.Body>
          <div ref={ref}>
            {inView || print.forceRender ? (
              children
            ) : (
              <Loading.Skeleton className="h-[300px] w-full" />
            )}
          </div>
        </Card.Body>
      </Card.Root>

      <Modal.Root open={expanded} onOpenChange={setExpanded}>
        <Modal.Content size="5xl">
          <Modal.Header title={title} description={description} />
          <Modal.Body>
            {expandedOption && <Chart option={expandedOption} height={560} />}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </ChartCardContext.Provider>
  );
}
