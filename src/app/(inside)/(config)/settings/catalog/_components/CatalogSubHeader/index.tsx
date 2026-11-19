"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";

import { CatalogPageHref } from "../../interface";
import { CATALOG_GROUPS, CATALOG_PAGES } from "../../utils";

interface Props {
  /**
   * A rota deste catálogo — é por ela que o ícone, a cor e o texto
   * (`CATALOG_PAGES`) são encontrados.
   */
  href: CatalogPageHref;
}

/**
 * Header das telas de um catálogo (categorias, unidades, rótulos, impostos).
 *
 * O ícone vem do MESMO registro que desenha o card do índice: quem clicou no
 * cartão de "Unidades" chega numa tela com o mesmo ícone (na cor da marca, como
 * todo header), e é essa repetição que diz "você está onde clicou". Duas listas de ícones — uma
 * para o índice, outra para as telas — perderiam o pareamento no primeiro
 * catálogo novo.
 */
export function CatalogSubHeader({ href }: Props) {
  const { title, description } = CATALOG_PAGES[href];
  const group = CATALOG_GROUPS.find((g) =>
    g.links.some((l) => l.href === href)
  );
  const link = group?.links.find((l) => l.href === href);
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
            {/* Sem o nome do grupo acima do título (14/11/2026): o
                breadcrumb já diz de onde se veio, e o mesmo ícone do card faz o
                pareamento com o índice. */}
            {Icon ? (
              <PanelHeader.Heading icon={Icon}>{title}</PanelHeader.Heading>
            ) : (
              <PanelHeader.Title>{title}</PanelHeader.Title>
            )}
            <PanelHeader.Description>{description}</PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
