import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";

/**
 * Espelho do corpo da tela: os contadores, a frase do recorte e os cartões.
 *
 * Num arquivo próprio porque o `loading.tsx` da rota desenha a MESMA coisa — a
 * espera do servidor e a da rede têm de parecer a mesma tela, senão o conteúdo
 * salta de lugar quando chega.
 */
export function PendingSkeleton() {
  return (
    <>
      <div className="tablet:grid-cols-3 grid grid-cols-2 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Loading.Skeleton key={i} className="h-[76px] w-full" />
        ))}
      </div>
      <Loading.Skeleton className="h-14 w-[420px] max-w-full" />
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        {Array.from({ length: 4 }).map((_, card) => (
          <Grid.Item key={card}>
            <Loading.Skeleton className="h-[260px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>
    </>
  );
}
