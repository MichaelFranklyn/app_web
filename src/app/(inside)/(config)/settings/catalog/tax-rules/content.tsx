"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { TaxRulesSection } from "../_components/TaxRulesSection";

export default function TaxRulesContent() {
  return (
    <PageContent>
      <CatalogSubHeader href="/settings/catalog/tax-rules" />
      <TaxRulesSection />
    </PageContent>
  );
}
