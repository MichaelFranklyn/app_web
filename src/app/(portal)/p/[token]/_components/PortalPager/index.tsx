import { Button } from "@/components/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PortalPagerProps {
  token: string;
  page: number;
  hasNextPage: boolean;
}

/**
 * Navegação por LINK, não por botão com estado.
 *
 * O componente `Pagination` do sistema é client-side e depende do Apollo; aqui
 * a página inteira é servida pronta e não há JavaScript de aplicação nenhum na
 * tela. Dois links resolvem — e continuam funcionando com a conexão ruim de uma
 * loja, que é onde isto vai ser aberto: o `Button.Link` sai do servidor como
 * `<a>` e navega antes de qualquer JavaScript carregar.
 */
export function PortalPager({ token, page, hasNextPage }: PortalPagerProps) {
  const hrefFor = (target: number) =>
    target <= 1 ? `/p/${token}` : `/p/${token}?p=${target}`;

  if (page <= 1 && !hasNextPage) return null;

  return (
    <nav className="flex items-center justify-between gap-[12px] pt-[8px]">
      {page > 1 ? (
        <Button.Link
          href={hrefFor(page - 1)}
          appearance="outline"
          color="neutral"
          noUppercase
        >
          <Button.Icon icon={ChevronLeft} />
          <Button.Title>Mais recentes</Button.Title>
        </Button.Link>
      ) : (
        <span />
      )}

      {hasNextPage ? (
        <Button.Link
          href={hrefFor(page + 1)}
          appearance="outline"
          color="neutral"
          noUppercase
        >
          <Button.Title>Mais antigos</Button.Title>
          <Button.Icon icon={ChevronRight} />
        </Button.Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
