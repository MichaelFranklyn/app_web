"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { UnitsSection } from "../_components/UnitsSection";

export default function UnitsContent() {
  return (
    <PageContent>
      <CatalogSubHeader href="/settings/catalog/units" />
      <UnitsSection />
    </PageContent>
  );
}
