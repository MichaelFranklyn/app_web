import { portalFetch } from "@/services/graphql/portalFetch";
import { PORTAL_REPLENISHMENT } from "../gql";
import { PortalReplenishmentData } from "../interface";
import { PortalReplenishContent } from "./content";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalReplenishPage({ params }: PageProps) {
  const { token } = await params;

  const data = await portalFetch<PortalReplenishmentData>(
    PORTAL_REPLENISHMENT,
    token
  );
  const replenishment = data?.portalReplenishment?.data ?? null;

  return (
    <PortalReplenishContent
      token={token}
      available={replenishment !== null}
      horizonDays={replenishment?.horizonDays ?? 15}
      items={replenishment?.items ?? []}
    />
  );
}
