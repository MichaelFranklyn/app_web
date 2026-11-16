"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { LabelsSection } from "../_components/LabelsSection";

export default function LabelsContent() {
  return (
    <PageContent>
      <CatalogSubHeader href="/settings/catalog/labels" />
      <LabelsSection />
    </PageContent>
  );
}
