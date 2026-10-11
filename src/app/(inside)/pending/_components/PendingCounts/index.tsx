"use client";

import { StatCard } from "@/components/StatCard";

import { PendingTypeCount } from "../../interface";
import { countTone, PENDING_TYPE_LABEL, PENDING_TYPE_ORDER } from "../../utils";

interface Props {
  counts: PendingTypeCount[];
}

/**
 * Quantas pendências de cada tipo, no recorte de vendedor e período.
 *
 * Os quatro contadores aparecem sempre, mesmo zerados, e NÃO mudam com o filtro
 * de tipo: eles dizem o que existe para filtrar. Vermelho quando alguma é de
 * prioridade alta.
 */
export function PendingCounts({ counts }: Props) {
  const byType = new Map(counts.map((row) => [row.type, row]));

  return (
    <div
      className="tablet:grid-cols-4 grid grid-cols-2 gap-8"
      data-tour="pending-counts"
    >
      {PENDING_TYPE_ORDER.map((type) => {
        const row = byType.get(type);
        return (
          <StatCard
            key={type}
            label={PENDING_TYPE_LABEL[type]}
            value={row?.count ?? 0}
            tone={countTone(row?.count ?? 0, row?.highCount ?? 0)}
          />
        );
      })}
    </div>
  );
}
