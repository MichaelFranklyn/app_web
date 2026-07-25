"use client";

import { PageContent } from "@/components/PageContent";
import { CatalogSubHeader } from "../_components/CatalogSubHeader";
import { CategoriesSection } from "../_components/CategoriesSection";

export default function CategoriesContent() {
  return (
    <PageContent>
      <CatalogSubHeader
        title="Categorias de produtos"
        description="Agrupam produtos parecidos dentro de um segmento. É o que organiza o catálogo e os filtros na hora de montar um pedido."
      />
      <CategoriesSection />
    </PageContent>
  );
}
