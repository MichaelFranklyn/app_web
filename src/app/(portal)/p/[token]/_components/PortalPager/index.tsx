import { Button } from "@/components/Button";

interface PortalPagerProps {
  token: string;
  page: number;
  hasNextPage: boolean;
  /** Endereço de cada página. Padrão: a lista de compras (`/p/{token}?p=N`). */
  hrefFor?: (page: number) => string;
  previousLabel?: string;
  nextLabel?: string;
}

/**
 * Navegação por LINK, não por botão com estado.
 *
 * O componente `Pagination` do sistema é client-side e depende do Apollo; aqui
 * a página inteira é servida pronta e não há JavaScript de aplicação nenhum na
 * tela. Dois links resolvem — e continuam funcionando com a conexão ruim de uma
 * loja, que é onde isto vai ser aberto: o `Button.Link` sai do servidor como
 * `<a>` e navega antes de qualquer JavaScript carregar.
 *
 * Componente de SERVIDOR: nada de `Button.Icon` (lê o contexto do botão, que
 * é client) — com mais de uma página a tela quebrava.
 */
export function PortalPager({
  token,
  page,
  hasNextPage,
  hrefFor = (target: number) =>
    target <= 1 ? `/p/${token}` : `/p/${token}?p=${target}`,
  previousLabel = "Mais recentes",
  nextLabel = "Mais antigos",
}: PortalPagerProps) {
  if (page <= 1 && !hasNextPage) return null;

  return (
    <nav className="flex items-center justify-between gap-[12px] pt-[8px]">
      {page > 1 ? (
        <Button.Link
          href={hrefFor(page - 1)}
          appearance="outline"
          color="neutral"
        >
          <Button.Title>{previousLabel}</Button.Title>
        </Button.Link>
      ) : (
        <span />
      )}

      {hasNextPage ? (
        <Button.Link
          href={hrefFor(page + 1)}
          appearance="outline"
          color="neutral"
        >
          <Button.Title>{nextLabel}</Button.Title>
        </Button.Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
