import { gqlFetch } from "@/services/graphql/gqlFetch";
import { DocumentNode } from "graphql";
import PlatformHomeContent from "./content";
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
  RetentionQueryData,
  TenantHealthQueryData,
} from "./interface";
import { GROWTH_MONTHS } from "./utils";

/**
 * SSR dos oito recortes para semear o cache do Apollo — a tela pinta sem ida à
 * rede. Cada um falha por conta própria: o console é o que o SU abre justamente
 * quando algo está estranho, e uma tela em branco por causa de um agregado que
 * caiu seria o pior momento para isso.
 */
async function fetchSeed<T>(
  query: DocumentNode,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const { data } = await gqlFetch<T>({ query, variables });
    return data;
  } catch {
    return null;
  }
}

const Page = async () => {
  const [
    overview,
    attention,
    operation,
    health,
    adoption,
    growth,
    retention,
    engagement,
  ] = await Promise.all([
    fetchSeed<OverviewQueryData>(PLATFORM_OVERVIEW_QUERY),
    fetchSeed<AttentionQueryData>(PLATFORM_ATTENTION_QUERY),
    fetchSeed<OperationQueryData>(PLATFORM_OPERATION_QUERY),
    fetchSeed<TenantHealthQueryData>(PLATFORM_TENANT_HEALTH_QUERY),
    fetchSeed<AdoptionQueryData>(PLATFORM_ADOPTION_QUERY),
    fetchSeed<GrowthQueryData>(PLATFORM_GROWTH_QUERY, {
      months: GROWTH_MONTHS,
    }),
    fetchSeed<RetentionQueryData>(PLATFORM_RETENTION_QUERY, {
      months: GROWTH_MONTHS,
    }),
    fetchSeed<EngagementQueryData>(PLATFORM_ENGAGEMENT_QUERY),
  ]);

  // Nunca semear resultado vazio: o `cache-first` acertaria um hit vazio e o
  // bloco ficaria parado sem tentar de novo. A fila de atenção é a exceção —
  // vazia ali é um RESULTADO ("nada exigindo atenção"), não ausência de dado,
  // então basta a query ter respondido.
  return (
    <PlatformHomeContent
      seedOverview={overview?.platformOverview?.data ? overview : null}
      seedAttention={attention?.platformAttention?.data ? attention : null}
      seedOperation={operation?.platformOperation?.data ? operation : null}
      seedHealth={health?.platformTenantHealth?.data?.length ? health : null}
      seedAdoption={
        adoption?.platformFeatureAdoption?.data?.length ? adoption : null
      }
      seedGrowth={growth?.platformGrowth?.data?.length ? growth : null}
      // Retenção e engajamento são semeados assim que a query responde, mesmo
      // sem turma ou sem ninguém ativo: vazio ali é RESULTADO ("ninguém entrou
      // no período", "ninguém trabalhou"), não ausência de dado.
      seedRetention={retention?.platformRetention?.data ? retention : null}
      seedEngagement={engagement?.platformEngagement?.data ? engagement : null}
    />
  );
};

export default Page;
