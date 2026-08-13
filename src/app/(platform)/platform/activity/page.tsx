import { gqlFetch } from "@/services/graphql/gqlFetch";
import { DocumentNode } from "graphql";
import ActivityContent from "./content";
import {
  ACTIVITY_SUMMARY_QUERY,
  COMPANY_NAME_QUERY,
  PLATFORM_ACTIVITY_QUERY,
} from "./gql";
import {
  ActivityQueryData,
  ActivitySummaryQueryData,
  CompanyNameQueryData,
} from "./interface";
import {
  COMPANY_PARAM,
  activityListVariables,
  summaryVariables,
} from "./utils";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function fetchSeed<T>(
  query: DocumentNode,
  variables: Record<string, unknown>
): Promise<T | null> {
  try {
    const { data } = await gqlFetch<T>({ query, variables });
    return data;
  } catch {
    return null;
  }
}

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const raw = params[COMPANY_PARAM];
  const companyId = typeof raw === "string" && raw ? raw : null;

  const [list, summary, company] = await Promise.all([
    fetchSeed<ActivityQueryData>(
      PLATFORM_ACTIVITY_QUERY,
      activityListVariables(companyId)
    ),
    fetchSeed<ActivitySummaryQueryData>(
      ACTIVITY_SUMMARY_QUERY,
      summaryVariables(companyId)
    ),
    // Só para dizer de QUEM é o recorte no cabeçalho. Sem o nome, a tela
    // filtrada não se distingue da completa a não ser pelo tamanho da lista.
    companyId
      ? fetchSeed<CompanyNameQueryData>(COMPANY_NAME_QUERY, { id: companyId })
      : Promise.resolve(null),
  ]);

  const tenant = company?.platformTenant?.data ?? null;

  return (
    <ActivityContent
      companyId={companyId}
      companyName={tenant ? tenant.nomeFantasia || tenant.razaoSocial : null}
      initialData={list?.platform_activity?.edges?.length ? list : null}
      seedSummary={summary?.platformActivitySummary?.data ? summary : null}
    />
  );
};

export default Page;
