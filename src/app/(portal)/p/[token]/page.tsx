import { portalFetch } from "@/services/graphql/portalFetch";
import { pageToAfter } from "@/utils/pagination";
import { PortalContent } from "./content";
import { PORTAL_PURCHASES } from "./gql";
import { PortalPurchasesData } from "./interface";
import { parsePortalPage } from "./utils";

/** Poucos por página: o cliente lê no celular, e a lista é de rolagem, não de estudo. */
const PAGE_SIZE = 10;

/** Um ano fechado — a janela em que o dono da loja pensa a própria compra. */
const SUMMARY_MONTHS = 12;

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ p?: string }>;
}

export default async function PortalPurchasesPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const { p } = await searchParams;
  const page = parsePortalPage(p);

  const data = await portalFetch<PortalPurchasesData>(PORTAL_PURCHASES, token, {
    input: { first: PAGE_SIZE, after: pageToAfter(page, PAGE_SIZE) },
    months: SUMMARY_MONTHS,
  });

  return (
    <PortalContent
      summary={data?.portalPurchaseSummary?.data ?? null}
      orders={data?.portalOrders?.edges.map((edge) => edge.node) ?? []}
      totalCount={data?.portalOrders?.totalCount ?? 0}
      hasNextPage={data?.portalOrders?.pageInfo.hasNextPage ?? false}
      page={page}
      token={token}
    />
  );
}
