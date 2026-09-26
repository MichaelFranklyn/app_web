import { LinkExpired } from "@/components/LinkExpired";
import { PublicPage } from "@/components/PublicPage";
import { Title } from "@/components/Title";
import { portalFetch } from "@/services/graphql/portalFetch";
import { PortalHeader } from "./_components/PortalHeader";
import { PortalNav } from "./_components/PortalNav";
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
    <PublicPage.Root>
      <PortalHeader profile={profile} />

      <PublicPage.Main>
        <PortalNav token={token} />
        {children}
      </PublicPage.Main>

      <PublicPage.Footer>
        <Title variant="body-sm" color="muted">
          Dúvida sobre algum pedido? Fale com o seu representante.
        </Title>
      </PublicPage.Footer>
    </PublicPage.Root>
  );
}
