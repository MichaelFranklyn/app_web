import { Loading } from "@/components/Loading";

/**
 * Espera do sino: enquanto a lista não chega, o dropdown mostra três linhas
 * no MESMO desenho do item real (bolinha de severidade + título + corpo), para
 * a altura não saltar quando os avisos entram. Sem isso o painel abria dizendo
 * "Sem notificações por enquanto." antes de ter perguntado ao backend.
 */
export function NotificationSkeleton() {
  return (
    <div className="flex flex-col" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando notificações…</span>
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="flex items-start gap-10 border-b border-(--border) px-12 py-10 last:border-b-0"
        >
          <Loading.Skeleton className="mt-[6px] h-[8px] w-[8px] shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex items-center justify-between gap-8">
              <Loading.Skeleton className="h-[12px] w-[55%]" />
              <Loading.Skeleton className="h-[10px] w-[36px] shrink-0" />
            </div>
            <Loading.Skeleton className="h-[10px] w-[85%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
