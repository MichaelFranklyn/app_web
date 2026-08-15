import { portalFetch } from "@/services/graphql/portalFetch";
import { PORTAL_ORDER } from "../../gql";
import { PortalOrderData } from "../../interface";
import { PortalOrderNotFound } from "./_components/PortalOrderNotFound";
import { PortalOrderContent } from "./content";

interface PageProps {
  params: Promise<{ token: string; orderId: string }>;
}

export default async function PortalOrderPage({ params }: PageProps) {
  const { token, orderId } = await params;

  const data = await portalFetch<PortalOrderData>(PORTAL_ORDER, token, {
    id: orderId,
  });
  const order = data?.portalOrder?.data ?? null;

  // Pedido de outro cliente e pedido inexistente chegam aqui iguais — o backend
  // responde 404 para os dois de propósito. A tela também não distingue.
  if (!order) return <PortalOrderNotFound token={token} />;

  return <PortalOrderContent order={order} token={token} />;
}
