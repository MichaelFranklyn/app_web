import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

import { CATALOG_GROUPS } from "../utils";

/**
 * Espelha `content.tsx`: cabeçalho + um bloco por grupo de catálogo.
 *
 * Fica no grupo `(index)` de propósito: em `catalog/` este limite envolvia
 * também as subpáginas, e entrar em Segmentos/Etiquetas/… mostrava ~2s o
 * esqueleto do ÍNDICE antes do da subpágina (14/11/2026).
 *
 * A página conta os cinco catálogos no servidor antes de renderizar; sem este
 * limite de Suspense o navegador não receberia nada enquanto isso acontece.
 */
export default function CatalogSettingsLoading() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <PanelHeader.Heading {...PAGE_HEADING.catalog}>
          Catálogos da empresa
        </PanelHeader.Heading>
        <Loading.Skeleton className="h-14 w-[440px] max-w-full" />
      </div>

      <div className="flex flex-col gap-24">
        {CATALOG_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-12">
            <Loading.Skeleton className="h-12 w-24" />
            <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
              {group.links.map((link) => (
                <Grid.Item key={link.href}>
                  <Loading.Skeleton className="h-[172px] w-full" />
                </Grid.Item>
              ))}
            </Grid.Root>
          </div>
        ))}
      </div>
    </PageContent>
  );
}
