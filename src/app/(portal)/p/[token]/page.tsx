import { portalFetch } from "@/services/graphql/portalFetch";
import { PortalContent } from "./content";
import { PORTAL_PROFILE, PORTAL_PURCHASE_SUMMARY } from "./gql";
import { PortalProfileData, PortalPurchaseSummaryData } from "./interface";

/** Um ano fechado — a janela em que o dono da loja pensa a própria compra. */
const SUMMARY_MONTHS = 12;

interface PageProps {
  params: Promise<{ token: string }>;
}

/**
 * A primeira tela do portal: o retrato das compras. A lista de pedidos mora em
 * "Pedidos" (`/enviados`), que já junta pedidos feitos e orçamentos — repetir
 * a lista aqui eram dois lugares para a mesma coisa.
 */
export default async function PortalSummaryPage({ params }: PageProps) {
  const { token } = await params;

  // O perfil (já validado no layout) dá o nome do cliente ao cabeçalho.
  const [profileData, data] = await Promise.all([
    portalFetch<PortalProfileData>(PORTAL_PROFILE, token),
    portalFetch<PortalPurchaseSummaryData>(PORTAL_PURCHASE_SUMMARY, token, {
      months: SUMMARY_MONTHS,
    }),
  ]);

  return (
    <PortalContent
      profile={profileData?.portalProfile?.data ?? null}
      summary={data?.portalPurchaseSummary?.data ?? null}
      token={token}
    />
  );
}
