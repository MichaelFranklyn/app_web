import { CatalogPageSkeleton } from "../_components/CatalogPageSkeleton";

// Limite próprio: sem ele vale o do índice (`../loading.tsx`), e quem abre
// este catálogo veria o esqueleto dos cards do índice.
export default function Loading() {
  return <CatalogPageSkeleton href="/settings/catalog/segments" />;
}
