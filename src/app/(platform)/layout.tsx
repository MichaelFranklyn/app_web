import { AppProviders } from "@/components/AppProviders";
import { requirePlatformPage } from "@/utils/auth/roleGuard";
import type { Metadata } from "next";
import { PlatformShell } from "./_components/PlatformShell";

/**
 * Console da plataforma — grupo de rotas próprio, com casca própria.
 *
 * O guard é server-side e vale para TODA a subárvore: quem não é da plataforma
 * (super usuário ou suporte) é redirecionado antes de qualquer query SSR rodar.
 * A única tela mais restrita é a da equipe, que repete o guard estrito de SU no
 * próprio `page.tsx`. É o que muda em relação ao
 * `/companies` anterior, que checava o cookie `userData` já no cliente — cookie
 * legível e gravável por JavaScript, portanto um gate que só desenhava a
 * recusa. O backend barra de todo jeito (`@is_platform_user`); o guard aqui é o
 * que impede a tela abrir para depois estourar erro em cada query.
 *
 * Como só decodifica um cookie (sem rede), não precisa de `loading.tsx` neste
 * nível — o vazio de layout assíncrono que exigiria um Suspense não existe aqui.
 */
/** O console da plataforma não existe para o mundo lá fora. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformPage();

  return (
    <AppProviders>
      <PlatformShell>{children}</PlatformShell>
    </AppProviders>
  );
}
