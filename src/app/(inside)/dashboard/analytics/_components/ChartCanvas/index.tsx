"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import type { EChartsCoreOption } from "echarts/core";
import { BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";

import { useChartCard } from "../../chartCardContext";
import { customizeChart } from "../../chartCustomize";

// echarts só é baixado quando o 1º gráfico monta (chunk assíncrono, sem SSR).
const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[300px] w-full" />,
});

interface Props {
  loading: boolean;
  hasData: boolean;
  option: EChartsCoreOption;
  height?: number;
}

/**
 * Corpo comum dos gráficos: skeleton no 1º load, EmptyState sem dados e, no
 * refetch (troca de filtro), mantém o gráfico anterior esmaecido — sem flash.
 * Registra a option/instância no card (menu de ações) e aplica rótulos quando
 * o card pede.
 */
export function ChartCanvas({ loading, hasData, option, height = 300 }: Props) {
  const { prefs, registerOption, registerInstance } = useChartCard();

  // Publica a option-base (sem rótulos) para o card poder expandir no modal.
  useEffect(() => {
    registerOption(hasData ? option : null);
  }, [option, hasData, registerOption]);

  // Sem gráfico montado (vazio/loading), não há instância para exportar.
  useEffect(() => {
    if (!hasData) registerInstance(null);
  }, [hasData, registerInstance]);

  useEffect(() => () => registerInstance(null), [registerInstance]);

  if (loading && !hasData) {
    return <Loading.Skeleton className="h-[300px] w-full" />;
  }

  if (!hasData) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <BarChart3 size={32} />
        </EmptyState.Icon>
        <EmptyState.Title>Sem dados no período</EmptyState.Title>
        <EmptyState.Description>
          Ajuste o período ou o vendedor no filtro acima.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <div
      className="transition-opacity duration-200"
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      <Chart
        option={customizeChart(option, prefs)}
        height={height}
        onInit={registerInstance}
      />
    </div>
  );
}
