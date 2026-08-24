import { gqlFetch } from "@/services/graphql/gqlFetch";
import { requireAdminPage } from "@/utils/auth/roleGuard";
import CatalogSettingsContent from "./content";
import { CATALOG_COUNTS_INPUT, CATALOG_COUNTS_QUERY } from "./gql";
import { CatalogCountsData } from "./interface";

const Page = async () => {
  // Catálogos da empresa são gestão — vendedor só tem a config de rotina.
  await requireAdminPage("/profile");

  // As contagens saem daqui, e não de um `useQuery`: são cinco números que o
  // índice mostra de cara, e buscá-los do navegador faria os cinco cards
  // aparecerem sem rodapé e ganharem a linha meio segundo depois. Falha vira
  // `null` e os cards saem sem a contagem.
  let counts: CatalogCountsData | null = null;
  try {
    const { data } = await gqlFetch<CatalogCountsData>({
      query: CATALOG_COUNTS_QUERY,
      variables: { input: CATALOG_COUNTS_INPUT },
    });
    counts = data ?? null;
  } catch {
    counts = null;
  }

  return <CatalogSettingsContent counts={counts} />;
};

export default Page;
