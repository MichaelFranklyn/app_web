import { portalFetch } from "@/services/graphql/portalFetch";
import { PortalExpired } from "./_components/PortalExpired";
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

  if (!profile) return <PortalExpired />;

  return (
    <div className="flex min-h-screen flex-col">
      <PortalHeader profile={profile} />
      <PortalNav token={token} />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-[16px] py-[24px]">
        {children}
      </main>

      <footer className="border-t border-(--border) px-[16px] py-[24px]">
        <div className="mx-auto max-w-[1120px]">
          <p className="text-[12px] leading-relaxed text-(--muted)">
            Dúvida sobre algum pedido? Fale com o seu representante.
          </p>
        </div>
      </footer>
    </div>
  );
}
