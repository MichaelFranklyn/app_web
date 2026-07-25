"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { UnitsSection } from "../_components/UnitsSection";

export default function UnitsContent() {
  return (
    <PageContent>
      <CatalogSubHeader
        title="Unidades"
        description="Como o produto é medido e vendido. Cada produto escolhe uma unidade base — saco, metro, quilograma, unidade."
      />
      <UnitsSection />
    </PageContent>
  );
}
