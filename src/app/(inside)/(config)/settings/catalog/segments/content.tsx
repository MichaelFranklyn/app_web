"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { SegmentsSection } from "../_components/SegmentsSection";

export default function SegmentsContent() {
  return (
    <PageContent>
      <CatalogSubHeader
        href="/settings/catalog/segments"
        title="Segmentos de clientes"
        description="O ramo de atividade de cada cliente — farmácia, mercearia, atacado. Serve para filtrar a carteira e comparar os números por tipo de negócio."
      />
      <SegmentsSection />
    </PageContent>
  );
}
