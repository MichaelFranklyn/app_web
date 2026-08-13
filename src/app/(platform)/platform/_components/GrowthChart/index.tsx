"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";
import { PlatformGrowthPoint } from "../../interface";
import { hasGrowthMovement } from "../../utils";
import { buildGrowthOption } from "./option";

// O echarts só é baixado quando o gráfico monta (chunk assíncrono, sem SSR).
// Mesmo racional do `ChartCanvas` do analytics; não é reuso daquele componente
// porque ele depende do contexto de card daquele módulo, e importá-lo aqui
// cruzaria a fronteira entre dois grupos de rotas.
const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[300px] w-full" />,
});

interface Props {
  points: PlatformGrowthPoint[];
  loading: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function GrowthChart({ points, loading, error, onRetry }: Props) {
  const hasMovement = hasGrowthMovement(points);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Crescimento
        </Card.Header.Title>
        <Card.Header.Description>
          Empresas e pessoas novas por mês, com o volume de pedidos ao lado.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        {loading && !hasMovement ? (
          <Loading.Skeleton className="h-[300px] w-full" />
        ) : error && !hasMovement ? (
          <QueryError flat onRetry={onRetry} />
        ) : !hasMovement ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <BarChart3 size={32} />
            </EmptyState.Icon>
            {/* Aqui o vazio é o resultado, não falta de informação: a série vem
                completa do backend, com os meses parados zerados. */}
            <EmptyState.Title>
              Nenhum movimento nos últimos meses
            </EmptyState.Title>
            <EmptyState.Description>
              Nenhuma empresa ou pessoa nova entrou, e nenhum pedido foi
              registrado no período.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <Chart option={buildGrowthOption(points)} height={300} />
        )}
      </Card.Body>
    </Card.Root>
  );
}
