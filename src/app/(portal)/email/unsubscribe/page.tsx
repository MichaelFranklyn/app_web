import { LinkExpired } from "@/components/LinkExpired";
import { PublicPage } from "@/components/PublicPage";
import { Title } from "@/components/Title";
import { UnsubscribeContent } from "./content";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

/** O `robots: noindex` do layout `(portal)` vale aqui também. */
export const metadata = { title: "Emails do Itinus" };

/**
 * "Não quero mais receber", aberto pelo rodapé dos emails, sem login.
 *
 * Abrir a página não desliga nada — só o botão desliga (ver `actions.ts`).
 * O token só serve para DESLIGAR; não lê nem muda mais nada da conta.
 */
export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <LinkExpired>
        Para parar de receber os emails, entre no Itinus e desligue a opção em
        Meu perfil.
      </LinkExpired>
    );
  }

  return (
    <PublicPage.Root>
      <PublicPage.Header className="gap-[2px]">
        <Title variant="heading-sm">Emails do Itinus</Title>
        <Title variant="body-xs" color="muted">
          Parar de receber os resumos e lembretes
        </Title>
      </PublicPage.Header>

      <PublicPage.Main>
        <UnsubscribeContent token={token} />
      </PublicPage.Main>
    </PublicPage.Root>
  );
}
