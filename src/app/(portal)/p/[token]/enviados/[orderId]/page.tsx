import { portalFetch } from "@/services/graphql/portalFetch";
import { PORTAL_PROFILE, PORTAL_SENT_ORDER } from "../../gql";
import { PortalProfileData, PortalSentOrderData } from "../../interface";
import { PortalOrderNotFound } from "../../_components/PortalOrderNotFound";
import { PortalSentOrderContent } from "./content";

interface PageProps {
  params: Promise<{ token: string; orderId: string }>;
  searchParams: Promise<{ enviado?: string }>;
}

export default async function PortalSentOrderPage({
  params,
  searchParams,
}: PageProps) {
  const { token, orderId } = await params;
  const { enviado } = await searchParams;

  const [profileData, data] = await Promise.all([
    portalFetch<PortalProfileData>(PORTAL_PROFILE, token),
    portalFetch<PortalSentOrderData>(PORTAL_SENT_ORDER, token, { id: orderId }),
  ]);
  const order = data?.portalSentOrder?.data ?? null;

  // De outro cliente ou inexistente: o backend responde igual, a tela também.
  if (!order) {
    return (
      <PortalOrderNotFound
        token={token}
        backHref={`/p/${token}/enviados`}
        backLabel="Ver os pedidos"
      />
    );
  }

  const profile = profileData?.portalProfile?.data;
  return (
    <PortalSentOrderContent
      order={order}
      token={token}
      justSent={enviado === "1"}
      brand={{
        companyName: profile?.companyName ?? null,
        companyLogoUrl: profile?.companyLogoUrl ?? null,
      }}
    />
  );
}
