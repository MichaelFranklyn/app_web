import { LinkExpired } from "@/components/LinkExpired";
import { PublicPage } from "@/components/PublicPage";
import { Title } from "@/components/Title";
import { UnsubscribeContent } from "./content";
import { parseUnsubscribeKind, UNSUBSCRIBE_COPY } from "./utils";

interface PageProps {
  searchParams: Promise<{ token?: string; kind?: string }>;
}

/** O `robots: noindex` do layout `(portal)` vale aqui também. */
export const metadata = { title: "Emails do Itinus" };

/**
 * "Não quero mais receber", aberto pelo rodapé dos emails, sem login.
 *
 * Abrir a página não desliga nada — só o botão desliga (ver `actions.ts`).
 * O token só serve para DESLIGAR; não lê nem muda mais nada da conta.
 * `kind=client` é o contato do cliente (avisos de pedido) — ver `utils.ts`.
 */
export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token, kind: rawKind } = await searchParams;
  const kind = parseUnsubscribeKind(rawKind);
  const copy = UNSUBSCRIBE_COPY[kind];

  if (!token) return <LinkExpired>{copy.invalidLink}</LinkExpired>;

  return (
    <PublicPage.Root>
      <PublicPage.Header className="gap-2">
        <Title variant="heading-sm">{copy.title}</Title>
        <Title variant="body-xs" color="muted">
          {copy.subtitle}
        </Title>
      </PublicPage.Header>

      <PublicPage.Main>
        <UnsubscribeContent token={token} kind={kind} copy={copy} />
      </PublicPage.Main>
    </PublicPage.Root>
  );
}
