"use client";

import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import {
  PLATFORM_ADOPTION_QUERY,
  PLATFORM_ATTENTION_QUERY,
  PLATFORM_ENGAGEMENT_QUERY,
  PLATFORM_GROWTH_QUERY,
  PLATFORM_OPERATION_QUERY,
  PLATFORM_OVERVIEW_QUERY,
  PLATFORM_RETENTION_QUERY,
  PLATFORM_TENANT_HEALTH_QUERY,
} from "./gql";
import {
  AdoptionQueryData,
  AttentionQueryData,
  EngagementQueryData,
  GrowthQueryData,
  OperationQueryData,
  OverviewQueryData,
  PlatformHomeProps,
  RetentionQueryData,
  TenantHealthQueryData,
} from "./interface";
import { GROWTH_MONTHS } from "./utils";

/**
 * Os oito recortes da visão geral.
 *
 * Todos saem JUNTOS, não encadeados: são independentes entre si e as séries
 * longas (crescimento e retenção) são as mais lentas — esperar por elas
 * seguraria os KPIs, que são baratos. Cada bloco pinta assim que o seu chega.
 *
 * As variables precisam bater byte a byte com as do SSR (`page.tsx`), senão o
 * seed vira cache-miss e o waterfall de rede volta. `period` omitido dos dois
 * lados = janela padrão de 30 dias.
 */
export function usePlatformOverview({
  seedOverview,
  seedGrowth,
  seedAttention,
  seedOperation,
  seedHealth,
  seedAdoption,
  seedRetention,
  seedEngagement,
}: PlatformHomeProps) {
  useSeedQuery([
    { query: PLATFORM_OVERVIEW_QUERY, data: seedOverview },
    { query: PLATFORM_ATTENTION_QUERY, data: seedAttention },
    { query: PLATFORM_OPERATION_QUERY, data: seedOperation },
    { query: PLATFORM_TENANT_HEALTH_QUERY, data: seedHealth },
    { query: PLATFORM_ADOPTION_QUERY, data: seedAdoption },
    { query: PLATFORM_ENGAGEMENT_QUERY, data: seedEngagement },
    {
      query: PLATFORM_GROWTH_QUERY,
      variables: { months: GROWTH_MONTHS },
      data: seedGrowth,
    },
    {
      query: PLATFORM_RETENTION_QUERY,
      variables: { months: GROWTH_MONTHS },
      data: seedRetention,
    },
  ]);

  const overviewQuery = useQuery<OverviewQueryData>(PLATFORM_OVERVIEW_QUERY);
  const attentionQuery = useQuery<AttentionQueryData>(PLATFORM_ATTENTION_QUERY);
  const operationQuery = useQuery<OperationQueryData>(PLATFORM_OPERATION_QUERY);
  const healthQuery = useQuery<TenantHealthQueryData>(
    PLATFORM_TENANT_HEALTH_QUERY
  );
  const adoptionQuery = useQuery<AdoptionQueryData>(PLATFORM_ADOPTION_QUERY);
  const growthQuery = useQuery<GrowthQueryData>(PLATFORM_GROWTH_QUERY, {
    variables: { months: GROWTH_MONTHS },
  });
  const retentionQuery = useQuery<RetentionQueryData>(
    PLATFORM_RETENTION_QUERY,
    {
      variables: { months: GROWTH_MONTHS },
    }
  );
  const engagementQuery = useQuery<EngagementQueryData>(
    PLATFORM_ENGAGEMENT_QUERY
  );

  return {
    overview: overviewQuery.data?.platformOverview?.data ?? null,
    overviewLoading: overviewQuery.loading,
    overviewError: overviewQuery.error,
    refetchOverview: overviewQuery.refetch,

    attention: attentionQuery.data?.platformAttention?.data ?? [],
    attentionLoading: attentionQuery.loading,

    operation: operationQuery.data?.platformOperation?.data ?? null,

    health: healthQuery.data?.platformTenantHealth?.data ?? [],
    healthLoading: healthQuery.loading,

    adoption: adoptionQuery.data?.platformFeatureAdoption?.data ?? [],

    growth: growthQuery.data?.platformGrowth?.data ?? [],
    growthLoading: growthQuery.loading,
    growthError: growthQuery.error,
    refetchGrowth: growthQuery.refetch,

    retention: retentionQuery.data?.platformRetention?.data ?? null,
    retentionLoading: retentionQuery.loading,

    engagement: engagementQuery.data?.platformEngagement?.data ?? null,
    engagementLoading: engagementQuery.loading,
  };
}
