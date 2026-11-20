import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

/** Título de seção com o "?" ao lado e a linha de explicação embaixo. */
function SectionHeadingSkeleton({ help = false }: { help?: boolean }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-6">
        <Loading.Skeleton className="h-[18px] w-[120px]" />
        {help && <Loading.Skeleton shape="pill" className="size-[28px]" />}
      </div>
      <Loading.Skeleton className="h-[12px] w-[420px] max-w-full" />
      <Loading.Skeleton className="desktop:hidden h-[12px] w-[160px]" />
    </div>
  );
}

/**
 * Espelha `content.tsx` na ordem em que a tela real monta: cabeçalho, o aviso
 * do plano (no celular o "Comparar planos" desce e toma a linha, por isso o
 * aviso é mais alto), a assinatura, os quatro limites e a grade de recursos.
 *
 * Serve ao `loading.tsx` e ao carregamento do cliente.
 */
export function PlanSkeleton() {
  return (
    <PageContent>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-8">
          <PanelHeader.Heading {...PAGE_HEADING.plan}>
            Plano da empresa
          </PanelHeader.Heading>
          <Loading.Skeleton className="h-[14px] w-[420px] max-w-full" />
          <Loading.Skeleton className="desktop:hidden h-[14px] w-[180px]" />
        </div>
        <Loading.Skeleton
          shape="md"
          className="desktop:h-[58px] h-[112px] w-full"
        />
      </div>

      <section className="flex flex-col gap-12">
        <Loading.Skeleton className="h-[18px] w-[110px]" />
        <Loading.Skeleton
          shape="md"
          className="desktop:h-[104px] h-[136px] w-full"
        />
      </section>

      <section className="flex flex-col gap-12">
        <SectionHeadingSkeleton help />
        <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid.Item key={i}>
              <Loading.Skeleton shape="md" className="h-[132px] w-full" />
            </Grid.Item>
          ))}
        </Grid.Root>
      </section>

      <section className="flex flex-col gap-12">
        <SectionHeadingSkeleton help />
        <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 3 }} gap={12}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid.Item key={i}>
              <Loading.Skeleton shape="md" className="h-[76px] w-full" />
            </Grid.Item>
          ))}
        </Grid.Root>
      </section>
    </PageContent>
  );
}
