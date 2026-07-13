import { executeServerQueries } from "@/services/graphql/getDataServer";
import FactoriesContent from "./content";
import { COMPANY_FACTORIES_QUERY } from "./gql";
import { CompanyFactoriesQueryData, ITEMS_PER_PAGE } from "./interface";

const Page = async () => {
  // 1ª página da lista no servidor → semeia o cache do Apollo no cliente
  // (via useTableData) e pinta a lista sem waterfall de rede.
  const data = await executeServerQueries<CompanyFactoriesQueryData>({
    company_factories_list: {
      query: COMPANY_FACTORIES_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`company_factories_list`], noCache: true },
    },
  });

  return <FactoriesContent initialData={data} />;
};

export default Page;
