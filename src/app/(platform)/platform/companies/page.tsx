import { gqlFetch } from "@/services/graphql/gqlFetch";
import TenantsContent from "./content";
import { PLATFORM_TENANTS_QUERY } from "./gql";
import { QueryData } from "./interface";
import { ITEMS_PER_PAGE } from "./utils";

/**
 * Primeira página no servidor para semear o cache do Apollo. As variables têm
 * de ser IDÊNTICAS às do estado inicial do `useTableData` — página 1, sem
 * filtro, sem ordenação explícita —, senão o seed vira cache-miss.
 *
 * O guard de SU é do layout do grupo `(platform)`.
 */
const Page = async () => {
  let initialData: QueryData | null = null;

  try {
    const { data } = await gqlFetch<QueryData>({
      query: PLATFORM_TENANTS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
    });
    // Semear vazio seria pior que não semear: o `cache-first` acertaria um hit
    // vazio e a lista ficaria parada sem tentar de novo.
    initialData = data?.platform_tenants?.edges?.length ? data : null;
  } catch {
    initialData = null;
  }

  return <TenantsContent initialData={initialData} />;
};

export default Page;
