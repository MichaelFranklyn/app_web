"use client";

import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { AdoptionCard } from "./_components/AdoptionCard";
import { AttentionQueue } from "./_components/AttentionQueue";
import { EngagementCard } from "./_components/EngagementCard";
import { GrowthChart } from "./_components/GrowthChart";
import { OperationCard } from "./_components/OperationCard";
import { PlatformKpis } from "./_components/PlatformKpis";
import { RetentionCard } from "./_components/RetentionCard";
import { TenantHealthCard } from "./_components/TenantHealthCard";
import { PlatformHomeProps } from "./interface";
import { usePlatformOverview } from "./usePlatformOverview";

/**
 * A tela é lida de cima para baixo em ordem de urgência: primeiro o que exige
 * ação, depois o retrato da plataforma, depois o que está acontecendo em cada
 * empresa, e por fim o que o produto entrega e ninguém usa.
 */
export default function PlatformHomeContent(props: PlatformHomeProps) {
  const {
    overview,
    overviewLoading,
    overviewError,
    refetchOverview,
    attention,
    attentionLoading,
    operation,
    health,
    healthLoading,
    adoption,
    growth,
    growthLoading,
    growthError,
    refetchGrowth,
    retention,
    retentionLoading,
    engagement,
    engagementLoading,
  } = usePlatformOverview(props);

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow className="text-(--purple)">
              Console
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>Visão geral</PanelHeader.Title>
            <PanelHeader.Description>
              Números de toda a plataforma nos últimos 30 dias.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {attentionLoading && attention.length === 0 ? (
        <Loading.Skeleton className="h-[88px] w-full" />
      ) : (
        <AttentionQueue items={attention} />
      )}

      {/* Os KPIs são o dado primário: erro aqui vira QueryError, não um zero
          silencioso que se leria como "a plataforma está vazia". */}
      {overviewError && !overview ? (
        <QueryError onRetry={() => refetchOverview()} />
      ) : overview ? (
        <PlatformKpis overview={overview} />
      ) : (
        <Loading.Skeleton className="h-[104px] w-full" />
      )}

      {operation ? (
        <OperationCard operation={operation} />
      ) : (
        <Loading.Skeleton className="h-[160px] w-full" />
      )}

      {/* Logo depois da operação: aquela mede o trabalho feito, esta mede
          quantas pessoas o fizeram — e o mesmo volume com metade da gente é um
          negócio mais frágil, não mais eficiente. */}
      {engagement ? (
        <EngagementCard engagement={engagement} />
      ) : engagementLoading ? (
        <Loading.Skeleton className="h-[380px] w-full" />
      ) : null}

      <GrowthChart
        points={growth}
        loading={growthLoading || overviewLoading}
        error={growthError}
        onRetry={() => refetchGrowth()}
      />

      {/* Colado no crescimento, e não em outro lugar da página: o gráfico acima
          conta quem chegou e esta grade conta quem ficou. Separá-los deixaria a
          primeira leitura sozinha, que é como se lê crescimento errado. */}
      {retention ? (
        <RetentionCard retention={retention} />
      ) : retentionLoading ? (
        <Loading.Skeleton className="h-[320px] w-full" />
      ) : null}

      {healthLoading && health.length === 0 ? (
        <Loading.Skeleton className="h-[240px] w-full" />
      ) : (
        <TenantHealthCard rows={health} />
      )}

      {adoption.length > 0 && <AdoptionCard features={adoption} />}
    </PageContent>
  );
}
