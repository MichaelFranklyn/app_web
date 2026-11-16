import { LinkExpired } from "@/components/LinkExpired";
import { portalFetch } from "@/services/graphql/portalFetch";
import { PortalShell } from "./_components/PortalShell";
import { PORTAL_PROFILE } from "./gql";
import { PortalProfileData } from "./interface";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}

/**
 * Casca das telas do portal.
 *
 * A validade do link é checada AQUI, uma vez, e não em cada página: sem isso,
 * cada rota nova precisaria lembrar de tratar o link morto, e a que esquecesse
 * mostraria uma tela quebrada em vez do recado. Se o perfil não vem, nenhuma
 * filha chega a rodar.
 */
export default async function PortalTokenLayout({
  children,
  params,
}: LayoutProps) {
  const { token } = await params;

  const data = await portalFetch<PortalProfileData>(PORTAL_PROFILE, token);
  const profile = data?.portalProfile?.data ?? null;

  if (!profile) {
    return (
      <LinkExpired>
        Peça um link novo ao seu representante — ele consegue gerar outro na
        hora.
      </LinkExpired>
    );
  }

  return (
    <PortalShell token={token} profile={profile}>
      {children}
    </PortalShell>
  );
}
