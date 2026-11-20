"use client";

import { Loading } from "@/components/Loading";

/** Dois dias, com duas e uma visita: a forma do que vai chegar. */
const DAYS = [
  { day: "w-[92px]", visits: ["w-[180px]", "w-[150px]"] },
  { day: "w-[80px]", visits: ["w-[165px]"] },
];

/**
 * Enquanto as visitas marcadas carregam: o rótulo do dia e, em cada visita, o
 * nome, o lugar e o selo de visita × contato — com as medidas das linhas de
 * verdade, para a coluna não pular quando chegam.
 */
export function ScheduledVisitsSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      {DAYS.map(({ day, visits }) => (
        <div key={day} className="flex flex-col gap-4">
          {/* body-xs: 18px de linha. */}
          <Loading.Skeleton className={`my-[3.5px] h-[11px] ${day}`} />
          {visits.map((name) => (
            <div key={name} className="flex items-center justify-between gap-8">
              <div className="flex min-w-0 flex-col">
                {/* body-sm (21px) e body-xs (18px), como nome e lugar. */}
                <Loading.Skeleton
                  className={`my-[4px] h-[13px] max-w-full ${name}`}
                />
                <Loading.Skeleton className="my-[3.5px] h-[11px] w-[120px]" />
              </div>
              <Loading.Skeleton shape="pill" className="h-[29px] w-[64px]" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
