import { Loading } from "@/components/Loading";

/**
 * Esqueleto da folha de resposta.
 *
 * O `portalFetch`/`visitResponseFetch` roda no servidor e a página só é
 * enviada quando o backend responde. Sem este limite de Suspense, o vendedor
 * abre o link no celular e olha uma tela BRANCA enquanto o Cloud Run acorda —
 * e um link que parece não carregar é um link que ninguém responde duas vezes.
 */
export default function VisitResponseLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-(--border) px-[16px] py-[16px]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-[6px]">
          <Loading.Skeleton className="h-[20px] w-[180px]" />
          <Loading.Skeleton className="h-[14px] w-[220px]" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-[16px] py-[24px]">
        <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-[12px]">
          {Array.from({ length: 6 }).map((_, index) => (
            <Loading.Skeleton key={index} className="h-[240px] w-full" />
          ))}
        </div>
      </main>
    </div>
  );
}
