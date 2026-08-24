import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";

/**
 * Espelho do corpo da tela: a faixa de números e duas fileiras de cartões.
 *
 * Vive num componente próprio porque o `loading.tsx` da rota desenha a MESMA
 * coisa — a espera do servidor e a da rede têm de parecer a mesma tela, senão o
 * conteúdo salta de lugar quando chega.
 */
export function InsightsSkeleton() {
  return (
    <>
      <Grid.Root cols={{ base: 2, "desktop-xl": 4 }} gap={12}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid.Item key={i}>
            <Loading.Skeleton className="h-[104px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>

      <div className="flex flex-col gap-24">
        {Array.from({ length: 2 }).map((_, section) => (
          <div key={section} className="flex flex-col gap-12">
            <Loading.Skeleton className="h-16 w-[220px]" />
            <Grid.Root cols={{ base: 1, "desktop-xl": 2 }} gap={16}>
              {Array.from({ length: 2 }).map((_, card) => (
                <Grid.Item key={card}>
                  <Loading.Skeleton className="h-[240px] w-full" />
                </Grid.Item>
              ))}
            </Grid.Root>
          </div>
        ))}
      </div>
    </>
  );
}
