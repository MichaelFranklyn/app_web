import { executeServerQueries } from "@/services/graphql/getDataServer";
import { requireAdminPage } from "@/utils/auth/roleGuard";
import NetworksContent from "./content";
import { CLIENT_NETWORKS_QUERY } from "./gql";
import { ClientNetworksData } from "./interface";
import { ITEMS_PER_PAGE } from "./utils";

const Page = async () => {
  // Rede é classificação da carteira — mesma régua dos catálogos: gestão.
  await requireAdminPage("/clients");

  // 1ª página no shape da própria query → semeia o cache do Apollo no cliente
  // (via useTableData) e a lista pinta sem waterfall, como na carteira.
  const data = await executeServerQueries<ClientNetworksData>({
    client_networks: {
      query: CLIENT_NETWORKS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`client_networks`] },
    },
  });

  return <NetworksContent initialData={data} />;
};

export default Page;
