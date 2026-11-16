import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

/**
 * Limite próprio do detalhe do pedido.
 *
 * Sem ele, quem toca num card veria o esqueleto da LISTA (o `loading.tsx` de
 * `p/[token]`, o limite mais próximo) — a tela que ele acabou de deixar — e
 * pensaria que o toque não funcionou.
 */
export default function PortalOrderLoading() {
  return (
    <>
      <div className="flex flex-col gap-8">
        <Loading.Skeleton className="h-[16px] w-[180px]" />
        <PanelHeader.HeadingSkeleton
          {...PAGE_HEADING.orders}
          barClassName="w-[200px]"
        />
      </div>
      <div className="desktop:flex-row flex flex-col gap-20">
        <Loading.Skeleton className="h-[320px] w-full flex-1" />
        <div className="desktop:w-[320px] flex w-full shrink-0 flex-col gap-12">
          <Loading.Skeleton className="h-[160px] w-full" />
          <Loading.Skeleton className="h-[140px] w-full" />
        </div>
      </div>
    </>
  );
}
