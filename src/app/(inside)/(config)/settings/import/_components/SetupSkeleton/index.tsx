import { Loading } from "@/components/Loading";

/** A barra de progresso e os cartões dos passos enquanto o progresso carrega. */
export function SetupSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-busy="true">
      <Loading.Skeleton className="h-[40px] w-full" />
      {Array.from({ length: 5 }, (_, i) => (
        <Loading.Skeleton key={i} className="h-[120px] w-full" />
      ))}
    </div>
  );
}
