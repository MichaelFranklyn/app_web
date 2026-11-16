import { portalFetch } from "@/services/graphql/portalFetch";
import {
  PORTAL_PROFILE,
  PORTAL_SENT_ORDERS,
  PORTAL_SENT_ORDERS_SUMMARY,
} from "../gql";
import {
  PortalProfileData,
  PortalSentOrdersData,
  PortalSentOrdersSummaryData,
} from "../interface";
import { parsePortalPage } from "../utils";
import { PortalSentOrdersContent } from "./content";
import {
  parseSentOrdersTab,
  sentOrdersKind,
  sentOrdersPageCount,
} from "./utils";

/** Poucos por página: a leitura é no celular. */
const PAGE_SIZE = 10;

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    p?: string;
    enviado?: string;
    tipo?: string;
    busca?: string;
  }>;
}

export default async function PortalSentOrdersPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const { p, enviado, tipo, busca } = await searchParams;
  const page = parsePortalPage(p);
  const tab = parseSentOrdersTab(tipo);
  const search = (busca ?? "").trim();

  const [profileData, data, summaryData] = await Promise.all([
    portalFetch<PortalProfileData>(PORTAL_PROFILE, token),
    portalFetch<PortalSentOrdersData>(PORTAL_SENT_ORDERS, token, {
      page,
      pageSize: PAGE_SIZE,
      kind: sentOrdersKind(tab),
      search: search || null,
    }),
    portalFetch<PortalSentOrdersSummaryData>(PORTAL_SENT_ORDERS_SUMMARY, token),
  ]);
  const list = data?.portalSentOrders;
  const total = list?.total ?? 0;

  return (
    <PortalSentOrdersContent
      token={token}
      page={page}
      tab={tab}
      search={search}
      justSent={enviado === "1"}
      orders={list?.data ?? []}
      total={total}
      totalPages={sentOrdersPageCount(total, PAGE_SIZE)}
      summary={summaryData?.portalSentOrdersSummary?.data ?? null}
      canOrder={
        profileData?.portalProfile?.data?.canRequestReplenishment ?? false
      }
    />
  );
}
