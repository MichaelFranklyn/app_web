"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { LabelsSection } from "../_components/LabelsSection";

export default function LabelsContent() {
  return (
    <PageContent>
      <CatalogSubHeader
        title="Rótulos de embalagem"
        description="O nome da embalagem em que o produto é entregue. Junto com as unidades por embalagem, define como o produto é comercializado (ex.: 12 sacos por pallet)."
      />
      <LabelsSection />
    </PageContent>
  );
}
