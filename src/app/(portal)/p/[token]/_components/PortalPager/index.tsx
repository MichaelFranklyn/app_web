import { Title } from "@/components/Title";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

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
 * loja, que é onde isto vai ser aberto.
 */
export function PortalPager({ token, page, hasNextPage }: PortalPagerProps) {
  const hrefFor = (target: number) =>
    target <= 1 ? `/p/${token}` : `/p/${token}?p=${target}`;

  if (page <= 1 && !hasNextPage) return null;

  const linkClass =
    "flex items-center gap-[6px] rounded-[8px] border border-(--border) px-[16px] py-[10px] text-(--text2) hover:bg-(--bg3)";

  return (
    <nav className="flex items-center justify-between gap-[12px] pt-[8px]">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          <ChevronLeft size={16} />
          <Title variant="body-sm">Mais recentes</Title>
        </Link>
      ) : (
        <span />
      )}

      {hasNextPage ? (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          <Title variant="body-sm">Mais antigos</Title>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
