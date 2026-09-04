"use client";

import { Loading } from "@/components/Loading";

/** Espelha o que vai aparecer: cinco números no topo e a tabela embaixo. */
export function ProductsSkeleton() {
  return (
    <div className="flex flex-col gap-16">
      <div className="tablet:grid-cols-3 desktop:grid-cols-5 grid grid-cols-2 gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Loading.Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
      <Loading.Skeleton className="h-[320px] w-full" />
    </div>
  );
}
