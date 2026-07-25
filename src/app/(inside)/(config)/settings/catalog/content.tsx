"use client";

import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { CatalogNavCard } from "./_components/CatalogNavCard";
import { CatalogHeader } from "./_components/CatalogHeader";
import { CATALOG_LINKS } from "./utils";

export default function CatalogSettingsContent() {
  return (
    <PageContent>
      <CatalogHeader />

      <Grid.Root
        cols={{ base: 1, desktop: 2 }}
        gap={16}
        data-tour="settings-catalog-sections"
      >
        {CATALOG_LINKS.map((link) => (
          <CatalogNavCard
            key={link.href}
            href={link.href}
            label={link.label}
            description={link.description}
            icon={link.icon}
          />
        ))}
      </Grid.Root>
    </PageContent>
  );
}
