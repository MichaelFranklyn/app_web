import { portalFetch } from "@/services/graphql/portalFetch";
import { PORTAL_CATALOG, PORTAL_REPLENISHMENT } from "../gql";
import { PortalCatalogData, PortalReplenishmentData } from "../interface";
import { parsePortalPage } from "../utils";
import { PortalOrderContent } from "./content";
import { parseCatalogSearch, parseFactoryParam } from "./utils";

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    q?: string | string[];
    p?: string | string[];
    f?: string | string[];
  }>;
}

/**
 * Fazer pedido: o que está acabando e o catálogo inteiro na mesma tela.
 *
 * Eram duas abas (Repor e Orçamento) que terminavam no mesmo lugar — um
 * pedido para o representante conferir. O cliente não precisa saber qual
 * das duas usar: escolhe os produtos e manda.
 */
export default async function PortalOrderPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const { q, p, f } = await searchParams;
  const search = parseCatalogSearch(q);
  const page = parsePortalPage(p);
  const factoryId = parseFactoryParam(f);

  const [replenishmentData, catalogData] = await Promise.all([
    portalFetch<PortalReplenishmentData>(PORTAL_REPLENISHMENT, token),
    portalFetch<PortalCatalogData>(PORTAL_CATALOG, token, {
      search,
      page,
      factoryId,
    }),
  ]);
  const replenishment = replenishmentData?.portalReplenishment?.data ?? null;
  const catalog = catalogData?.portalCatalog?.data ?? null;

  return (
    <PortalOrderContent
      token={token}
      available={catalog !== null}
      horizonDays={replenishment?.horizonDays ?? 15}
      runningOut={replenishment?.items ?? []}
      search={search}
      // O servidor devolve nula a fábrica que não atende o cliente.
      factoryId={catalog ? catalog.factoryId : factoryId}
      factories={catalog?.factories ?? []}
      page={catalog?.page ?? page}
      pageSize={catalog?.pageSize ?? 30}
      total={catalog?.total ?? 0}
      catalog={catalog?.items ?? []}
    />
  );
}
