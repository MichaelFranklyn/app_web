import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { ReactNode } from "react";

interface Props {
  /** Os `DataCardSkeleton` da seção, na mesma ordem dos cards reais. */
  children: ReactNode;
}

/**
 * O `DataSection` enquanto carrega: o título e a linha de descrição viram
 * barras da mesma altura, para a tela não pular quando os dados chegam.
 */
export function DataSectionSkeleton({ children }: Props) {
  return (
    <section className="flex flex-col gap-12" aria-hidden>
      <div className="flex flex-col gap-2">
        <Loading.Skeleton text="heading-sm" className="w-[180px] max-w-full" />
        <Loading.Skeleton text="body-sm" className="w-[320px] max-w-full" />
      </div>
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        {children}
      </Grid.Root>
    </section>
  );
}
