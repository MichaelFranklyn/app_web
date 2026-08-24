"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CatalogLinkWithCount } from "../../interface";
import { CATALOG_TONE, countLabel } from "../../utils";

interface Props {
  link: CatalogLinkWithCount;
  /** Quantos itens o catálogo tem. `null` quando a contagem não veio. */
  count: number | null;
}

/**
 * Atalho para um catálogo, com o tamanho dele à vista.
 *
 * O card inteiro é o link — alvo grande é mais fácil de acertar do que um texto
 * pequeno. A contagem no rodapé é o que faz a diferença entre um índice e um
 * painel: sem ela, descobrir que os rótulos de embalagem nunca foram
 * preenchidos exigia entrar em cada uma das cinco telas.
 */
export function CatalogNavCard({ link, count }: Props) {
  const { icon: Icon, label, description, href, tone, noun } = link;
  const skin = CATALOG_TONE[tone];
  const isEmpty = count === 0;

  return (
    <Link href={href} className="group block h-full focus-visible:outline-none">
      <Card.Root
        className={cn(
          "h-full transition-all duration-200",
          "group-hover:-translate-y-[2px] group-hover:border-(--border2) group-hover:shadow-(--shadow-md)",
          "group-focus-visible:border-(--amber) group-focus-visible:shadow-(--shadow-md)"
        )}
      >
        <Card.Body className="flex h-full flex-col gap-12">
          <div className="flex items-start gap-12">
            <span
              aria-hidden
              className={cn(
                "flex size-40 shrink-0 items-center justify-center rounded-(--r-md) transition-transform duration-200 group-hover:scale-105",
                skin.chip
              )}
            >
              <Icon size={19} />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Title variant="heading-sm">{label}</Title>
              <Title variant="body-sm" color="muted">
                {description}
              </Title>
            </div>
          </div>

          {/* O rodapé ancora no fim do card: a fileira só se lê de um golpe se
              as contagens ficarem na mesma linha, e as descrições têm alturas
              diferentes. */}
          <div className="mt-auto flex items-center justify-between gap-8 border-t border-(--border) pt-12">
            <Title
              variant="micro"
              color={isEmpty ? "muted" : undefined}
              weight={isEmpty ? "regular" : "semibold"}
            >
              {countLabel(count, noun)}
            </Title>
            <span
              aria-hidden
              className={cn(
                "shrink-0 transition-transform duration-200 group-hover:translate-x-[3px]",
                skin.icon
              )}
            >
              <ArrowRight size={16} />
            </span>
          </div>
        </Card.Body>
      </Card.Root>
    </Link>
  );
}
