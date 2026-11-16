"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { SegmentsSection } from "../_components/SegmentsSection";

export default function SegmentsContent() {
  return (
    <PageContent>
      <CatalogSubHeader href="/settings/catalog/segments" />
      <SegmentsSection />
    </PageContent>
  );
}
