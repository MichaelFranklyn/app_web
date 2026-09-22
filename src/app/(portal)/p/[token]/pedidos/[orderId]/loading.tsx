import { Loading } from "@/components/Loading";

/**
 * Limite próprio do detalhe do pedido.
 *
 * Sem ele, quem toca num card veria o esqueleto da LISTA (o `loading.tsx` de
 * `p/[token]`, o limite mais próximo) — a tela que ele acabou de deixar — e
 * pensaria que o toque não funcionou.
 */
export default function PortalOrderLoading() {
  return (
    <div className="flex flex-col gap-[16px]">
      <Loading.Skeleton className="h-[120px] w-full" />
      <Loading.Skeleton className="h-[240px] w-full" />
      <Loading.Skeleton className="h-[140px] w-full" />
    </div>
  );
}
