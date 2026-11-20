import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

import { CATALOG_GROUPS } from "../utils";

/** Espelha o `CatalogNavCard`: ícone, título, descrição e o rodapé da contagem. */
function NavCardSkeleton() {
  return (
    <Card.Root className="h-full">
      <Card.Body className="flex h-full flex-col gap-12">
        <div className="flex items-start gap-12">
          <Loading.Skeleton shape="md" className="size-40 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <Loading.Skeleton className="h-[18px] w-[140px] max-w-full" />
            <Loading.Skeleton className="h-[12px] w-full" />
            <Loading.Skeleton className="h-[12px] w-2/3" />
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-12">
          <Divider.Root />
          <div className="flex items-center justify-between gap-8">
            <Loading.Skeleton className="h-[12px] w-[96px]" />
            <Loading.Skeleton className="size-16" />
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}

/**
 * Espelha `content.tsx`: cabeçalho (descrição + total) e, por grupo, o rótulo
 * com a explicação e os cards de cada catálogo.
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
        <Loading.Skeleton className="h-[14px] w-[440px] max-w-full" />
        <Loading.Skeleton className="desktop:w-[300px] h-[14px] w-full" />
        <Loading.Skeleton className="desktop:hidden h-[14px] w-[200px]" />
        <Loading.Skeleton
          shape="pill"
          className="tablet:w-[180px] mt-6 h-[28px] w-full"
        />
      </div>

      <div className="flex flex-col gap-24">
        {CATALOG_GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-12">
            <div className="flex flex-col gap-8">
              <Loading.Skeleton className="h-[12px] w-[80px]" />
              <Loading.Skeleton className="h-[12px] w-[256px] max-w-full" />
            </div>
            <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
              {group.links.map((link) => (
                <Grid.Item key={link.href}>
                  <NavCardSkeleton />
                </Grid.Item>
              ))}
            </Grid.Root>
          </section>
        ))}
      </div>
    </PageContent>
  );
}
