import { portalFetch } from "@/services/graphql/portalFetch";
import { PORTAL_STOCK } from "../gql";
import { PortalStockData } from "../interface";
import { sortStockByUrgency } from "../utils";
import { PortalStockContent } from "./content";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalStockPage({ params }: PageProps) {
  const { token } = await params;

  const data = await portalFetch<PortalStockData>(PORTAL_STOCK, token);
  const items = data?.portalStock?.data ?? [];

  return <PortalStockContent items={sortStockByUrgency(items)} token={token} />;
}
