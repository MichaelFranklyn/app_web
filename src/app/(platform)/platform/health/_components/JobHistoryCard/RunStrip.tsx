"use client";

import { cn } from "@/lib/utils";
import { JobRunPoint } from "../../interface";
import { JOB_STATUS_LABEL, formatDuration, formatMoment } from "../../utils";

const STATUS_CLASS: Record<string, string> = {
  SUCCESS: "bg-(--green)",
  FAILED: "bg-(--red)",
  SKIPPED: "bg-(--amber)",
  RUNNING: "bg-(--blue)",
};

/**
 * Uma execução por traço, do mais antigo ao mais recente.
 *
 * Um gráfico completo para dez ou quinze pontos custaria mais atenção do que
 * entrega; o que se procura aqui é padrão — dois vermelhos seguidos, uma
 * sequência de amarelos —, e isso se enxerga na faixa inteira de uma vez. A
 * duração de cada execução vive no `title`, para o detalhe estar à mão sem
 * competir com o padrão.
 */
export function RunStrip({ runs }: { runs: JobRunPoint[] }) {
  return (
    <div className="flex flex-wrap items-center gap-[3px]">
      {runs.map((run, index) => (
        <span
          key={`${run.startedAt}-${index}`}
          className={cn(
            "h-[18px] w-[10px] rounded-[2px]",
            STATUS_CLASS[run.status] ?? "bg-(--bg3)"
          )}
          title={`${formatMoment(run.startedAt)} · ${
            JOB_STATUS_LABEL[run.status] ?? run.status
          } · ${formatDuration(run.durationMs)}`}
        />
      ))}
    </div>
  );
}
