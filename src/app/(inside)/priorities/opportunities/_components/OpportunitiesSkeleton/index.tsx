import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";

/**
 * Espelho do corpo da tela: a fileira de cartões de oportunidade.
 *
 * Vive num componente próprio porque o `loading.tsx` da rota desenha a MESMA
 * coisa — a espera do servidor e a da rede têm de parecer a mesma tela.
 */
export function OpportunitiesSkeleton() {
  return (
    <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
      {Array.from({ length: 2 }).map((_, card) => (
        <Grid.Item key={card}>
          <Loading.Skeleton className="h-[260px] w-full" />
        </Grid.Item>
      ))}
    </Grid.Root>
  );
}
