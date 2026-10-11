import { Loading } from "@/components/Loading";

/**
 * Espelho do corpo da tela: os contadores, a frase do recorte e a lista.
 *
 * Num arquivo próprio porque o `loading.tsx` da rota desenha a MESMA coisa — a
 * espera do servidor e a da rede têm de parecer a mesma tela, senão o conteúdo
 * salta de lugar quando chega.
 */
export function PendingSkeleton() {
  return (
    <>
      <div className="tablet:grid-cols-3 desktop:grid-cols-5 grid grid-cols-2 gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Loading.Skeleton key={i} className="h-[76px] w-full" />
        ))}
      </div>
      <Loading.Skeleton className="h-14 w-[420px] max-w-full" />
      <Loading.Skeleton className="h-[480px] w-full" />
    </>
  );
}
