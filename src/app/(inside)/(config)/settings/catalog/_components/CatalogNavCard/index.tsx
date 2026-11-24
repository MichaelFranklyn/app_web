"use client";

import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { IconTile } from "@/components/IconTile";
import { Title } from "@/components/Title";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CatalogLinkWithCount } from "../../interface";
import { CATALOG_TONE, countLabel } from "../../utils";
import { ICON_SIZE } from "@/components/Icon";

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
  const color = CATALOG_TONE[tone];
  const isEmpty = count === 0;

  return (
    <Link href={href} className="group block h-full focus-visible:outline-none">
      <Card.Root lift>
        <Card.Body className="h-full">
          <div className="flex items-start gap-12">
            <IconTile
              aria-hidden
              shape="square"
              size="lg"
              color={color}
              className="transition-transform duration-200 group-hover:scale-105"
            >
              <Icon />
            </IconTile>

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
          <div className="mt-auto flex flex-col gap-12">
            <Divider.Root />
            <div className="flex items-center justify-between gap-8">
              <Title
                variant="micro"
                color={isEmpty ? "muted" : undefined}
                weight={isEmpty ? "regular" : "semibold"}
              >
                {countLabel(count, noun)}
              </Title>
              {/* Seta neutra: a cor do módulo já está no ícone do alto, e a
                  seta verde/laranja somava um segundo acento por card — com
                  cinco cards, a tela virava um arco-íris (crítica de
                  configurações, 23/11/2026). Escurece no hover. */}
              <ArrowRight
                aria-hidden
                size={ICON_SIZE.md}
                className="shrink-0 stroke-(--color-text-muted) transition-transform duration-200 group-hover:translate-x-[3px] group-hover:stroke-(--color-text)"
              />
            </div>
          </div>
        </Card.Body>
      </Card.Root>
    </Link>
  );
}
