"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { cn } from "@/lib/utils";

import { CATALOG_GROUPS, CATALOG_TONE } from "../../utils";

interface Props {
  /** A rota deste catálogo — é por ela que o ícone e a cor são encontrados. */
  href: string;
  title: string;
  description: string;
}

/**
 * Header das telas de um catálogo (categorias, unidades, rótulos, impostos).
 *
 * O ícone e a cor vêm do MESMO registro que desenha o card do índice: quem
 * clicou no cartão roxo de "Unidades" chega numa tela com o mesmo ícone roxo, e
 * é essa repetição que diz "você está onde clicou". Duas listas de ícones — uma
 * para o índice, outra para as telas — perderiam o pareamento no primeiro
 * catálogo novo.
 */
export function CatalogSubHeader({ href, title, description }: Props) {
  const group = CATALOG_GROUPS.find((g) =>
    g.links.some((l) => l.href === href)
  );
  const link = group?.links.find((l) => l.href === href);
  const skin = link ? CATALOG_TONE[link.tone] : null;
  const Icon = link?.icon;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb.Root>
        <Breadcrumb.Item href="/settings/catalog">Catálogos</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item active>{title}</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            {group && skin && (
              <PanelHeader.Eyebrow className={skin.icon}>
                {group.title}
              </PanelHeader.Eyebrow>
            )}
            <div className="flex items-center gap-10">
              {Icon && skin && (
                <span
                  aria-hidden
                  className={cn(
                    "flex size-32 shrink-0 items-center justify-center rounded-(--r-md)",
                    skin.chip
                  )}
                >
                  <Icon size={17} />
                </span>
              )}
              <PanelHeader.Title>{title}</PanelHeader.Title>
            </div>
            <PanelHeader.Description>{description}</PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
