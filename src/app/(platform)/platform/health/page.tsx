import { gqlFetch } from "@/services/graphql/gqlFetch";
import { DocumentNode } from "graphql";
import PlatformHealthContent from "./content";
import {
  JOB_HISTORY_QUERY,
  OPERATION_HEALTH_QUERY,
  OPERATION_TREND_QUERY,
  PLATFORM_HEALTH_QUERY,
} from "./gql";
import {
  HealthQueryData,
  JobHistoryQueryData,
  OperationHealthQueryData,
  OperationTrendQueryData,
} from "./interface";

/**
 * Cada recorte falha por conta própria: o painel de saúde é o que o SU abre
 * justamente quando algo está estranho, e uma tela em branco por causa de um
 * agregado que caiu seria o pior momento para isso.
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
  const [health, operations, trend, jobs] = await Promise.all([
    fetchSeed<HealthQueryData>(PLATFORM_HEALTH_QUERY),
    fetchSeed<OperationHealthQueryData>(OPERATION_HEALTH_QUERY),
    fetchSeed<OperationTrendQueryData>(OPERATION_TREND_QUERY),
    fetchSeed<JobHistoryQueryData>(JOB_HISTORY_QUERY),
  ]);

  return (
    <PlatformHealthContent
      seed={health?.platformHealth?.data ? health : null}
      seedOperations={
        operations?.platformOperationHealth?.data ? operations : null
      }
      seedTrend={trend?.platformOperationTrend?.data ? trend : null}
      // Lista vazia aqui é RESULTADO ("nenhum job gravou ainda"), não ausência
      // de dado: basta a query ter respondido.
      seedJobs={jobs?.platformJobHistory?.data ? jobs : null}
    />
  );
};

export default Page;
