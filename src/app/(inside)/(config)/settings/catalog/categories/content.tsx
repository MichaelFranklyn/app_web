"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { CategoriesSection } from "../_components/CategoriesSection";

export default function CategoriesContent() {
  return (
    <PageContent>
      <CatalogSubHeader href="/settings/catalog/categories" />
      <CategoriesSection />
    </PageContent>
  );
}
