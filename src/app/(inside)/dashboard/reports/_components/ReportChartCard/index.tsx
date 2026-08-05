"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import type { EChartsCoreOption } from "echarts/core";
import { BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";

// echarts entra por chunk assíncrono, sem SSR: é biblioteca de DOM e pesada
// demais para o bundle inicial de uma tela que talvez não seja aberta.
const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[300px] w-full" />,
});

interface Props {
  title: string;
  /** O que o gráfico responde, em uma linha. */
  description?: string;
  option: EChartsCoreOption;
  hasData: boolean;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  height?: number;
  emptyDescription?: string;
}

/**
 * O gráfico do relatório dentro de um card.
 *
 * É deliberadamente mais simples que o `ChartCanvas` do Desempenho: lá cada
 * gráfico tem menu, rótulos configuráveis e entra no PDF da página inteira. Aqui
 * o gráfico é a leitura de relance de UM relatório, e a saída em arquivo é a
 * tabela — trazer aquela maquinaria para cá seria carregar peso que ninguém usa.
 */
export function ReportChartCard({
  title,
  description,
  option,
  hasData,
  loading,
  error,
  onRetry,
  height = 300,
  emptyDescription = "Ajuste o período ou o vendedor no filtro acima.",
}: Props) {
  const body = () => {
    if (loading && !hasData) {
      return <Loading.Skeleton className="h-[300px] w-full" />;
    }
    if (error && !hasData) return <QueryError flat onRetry={onRetry} />;
    if (!hasData) {
      return (
        <EmptyState.Root>
          <EmptyState.Icon>
            <BarChart3 size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Sem dados no período</EmptyState.Title>
          <EmptyState.Description>{emptyDescription}</EmptyState.Description>
        </EmptyState.Root>
      );
    }
    // No refetch (troca de filtro) o gráfico anterior fica esmaecido em vez de
    // sumir: o flash de vazio-e-volta é lido como erro.
    return (
      <div
        className="transition-opacity duration-200"
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        <Chart option={option} height={height} />
      </div>
    );
  };

  return (
    <Card.Root>
      <Card.Header>
        <Card.HeaderTitle>{title}</Card.HeaderTitle>
        {description && (
          <Card.HeaderDescription>{description}</Card.HeaderDescription>
        )}
      </Card.Header>
      <Card.Body>{body()}</Card.Body>
    </Card.Root>
  );
}
