"use client";

import { Grid } from "@/components/Grid";
import { CategoriesSection } from "./_components/CategoriesSection";
import { LabelsSection } from "./_components/LabelsSection";
import { TaxRulesSection } from "./_components/TaxRulesSection";
import { UnitsSection } from "./_components/UnitsSection";

export default function CatalogSettingsContent() {
  return (
    <div className="flex flex-col gap-20">
      <Grid.Root
        cols={{ base: 1, desktop: 2 }}
        gap={16}
        data-tour="settings-catalog-sections"
      >
        <CategoriesSection />
        <UnitsSection />
        <LabelsSection />
        <TaxRulesSection />
      </Grid.Root>
    </div>
  );
}
