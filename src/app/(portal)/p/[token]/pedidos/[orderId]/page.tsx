import { portalFetch } from "@/services/graphql/portalFetch";
import { PORTAL_ORDER, PORTAL_PROFILE } from "../../gql";
import { PortalOrderData, PortalProfileData } from "../../interface";
import { PortalOrderNotFound } from "../../_components/PortalOrderNotFound";
import { PortalOrderContent } from "./content";

interface PageProps {
  params: Promise<{ token: string; orderId: string }>;
}

export default async function PortalOrderPage({ params }: PageProps) {
  const { token, orderId } = await params;

  const [profileData, data] = await Promise.all([
    portalFetch<PortalProfileData>(PORTAL_PROFILE, token),
    portalFetch<PortalOrderData>(PORTAL_ORDER, token, { id: orderId }),
  ]);
  const order = data?.portalOrder?.data ?? null;

  // Pedido de outro cliente e pedido inexistente chegam aqui iguais — o backend
  // responde 404 para os dois de propósito. A tela também não distingue.
  if (!order) return <PortalOrderNotFound token={token} />;

  const profile = profileData?.portalProfile?.data;
  return (
    <PortalOrderContent
      order={order}
      token={token}
      brand={{
        companyName: profile?.companyName ?? null,
        companyLogoUrl: profile?.companyLogoUrl ?? null,
      }}
    />
  );
}
