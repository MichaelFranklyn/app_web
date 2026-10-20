import { UserData } from "@/app/(auth)/login/interface";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import { SettingsNav } from "./_components/SettingsNav";

/**
 * A área de Configurações: o menu interno de um lado, a tela do outro. Na
 * sidebar ela é um item só — as telas (Empresa, Plano, Pessoas, Catálogos,
 * Trazer dados) se escolhem aqui.
 *
 * O papel vem do cookie, lido no servidor: o menu nasce já recortado, sem
 * itens que somem depois da hidratação. É leitura local, não ida ao backend,
 * então não atrasa a tela (ver o layout de `(inside)`).
 */
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getServerCookie<UserData>("userData");
  return (
    // Sem gap: cada tela traz o próprio respiro (`PageContent`), e o menu se
    // alinha a ele — no desktop, o mesmo topo do título da tela.
    <div className="desktop:grid-cols-[220px_minmax(0,1fr)] grid grid-cols-1">
      <aside className="desktop:sticky desktop:top-0 desktop:self-start desktop:py-[28px] desktop:pl-32 min-w-0">
        <SettingsNav role={userData?.role} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
