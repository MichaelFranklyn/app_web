"use client";

import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { Title } from "@/components/Title";

import { CatalogHeader } from "./_components/CatalogHeader";
import { CatalogNavCard } from "./_components/CatalogNavCard";
import { CatalogCountsData } from "./interface";
import { CATALOG_GROUPS } from "./utils";

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
            <div className="flex flex-col gap-2">
              <Title variant="eyebrow" color="muted">
                {group.title}
              </Title>
              <Title variant="body-sm" color="muted">
                {group.description}
              </Title>
            </div>

            <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
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
