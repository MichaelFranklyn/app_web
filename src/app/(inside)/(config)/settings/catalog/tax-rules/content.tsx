"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { TaxRulesSection } from "../_components/TaxRulesSection";

export default function TaxRulesContent() {
  return (
    <PageContent>
      <CatalogSubHeader
        title="Regras de imposto"
        description="O catálogo de impostos da empresa. A alíquota de cada produto é definida depois, na tabela de preços."
      />
      <TaxRulesSection />
    </PageContent>
  );
}
