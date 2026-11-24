"use client";

import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { Title } from "@/components/Title";

import { CatalogHeader } from "../_components/CatalogHeader";
import { CatalogNavCard } from "../_components/CatalogNavCard";
import { CatalogCountsData } from "../interface";
import { CATALOG_GROUPS } from "../utils";

interface Props {
  /** Contagem de cada catálogo, buscada no servidor. Null: o SSR não conseguiu
   * e os cards ficam sem o rodapé — o índice continua servindo. */
  counts: CatalogCountsData | null;
}

export default function CatalogSettingsContent({ counts }: Props) {
  const totalItems = counts
    ? Object.values(counts).reduce(
        (sum, entry) => sum + (entry?.totalCount ?? 0),
        0
      )
    : null;

  return (
    <PageContent>
      <CatalogHeader totalItems={totalItems} />

      <div
        className="flex flex-col gap-24"
        data-tour="settings-catalog-sections"
      >
        {CATALOG_GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-12">
            {/* Título do grupo em peso de seção, não eyebrow cinza: era o
                texto mais apagado da tela e a divisão entre "Produtos" e
                "Impostos" se perdia (crítica de configurações, 23/11/2026). */}
            <div className="flex flex-col gap-2">
              <Title variant="heading-md">{group.title}</Title>
              <Title variant="body-sm" color="muted">
                {group.description}
              </Title>
            </div>

            {/* Três por fileira no desktop: em duas, o card ficava largo demais
                para duas linhas de texto e a página rolava à toa (crítica de
                configurações, 23/11/2026). */}
            <Grid.Root cols={{ base: 1, tablet: 2, desktop: 3 }} gap={16}>
              {group.links.map((link) => (
                <CatalogNavCard
                  key={link.href}
                  link={link}
                  count={counts?.[link.countKey]?.totalCount ?? null}
                />
              ))}
            </Grid.Root>
          </section>
        ))}
      </div>
    </PageContent>
  );
}
