"use client";

import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";

import { PendingWhen, PendingWhenCount } from "../../interface";
import {
  countTone,
  PENDING_WHEN_HINT,
  PENDING_WHEN_LABEL,
  PENDING_WHEN_ORDER,
} from "../../utils";

interface Props {
  counts: PendingWhenCount[];
  active: PendingWhen | null;
  onToggle: (when: PendingWhen) => void;
}

/**
 * Atrasadas · Hoje · Próximos 7 dias · Sem prazo — e cada número é um filtro.
 *
 * Contam no recorte de tipo, vendedor e período, mas NÃO mudam com a faixa
 * escolhida: dizem o que existe para clicar. Vermelho quando alguma é de
 * prioridade alta. "Sem prazo" só aparece quando há cadastro a corrigir — um
 * zero eterno ali ensinaria a ignorar a fileira.
 */
export function PendingCounts({ counts, active, onToggle }: Props) {
  const byWhen = new Map(counts.map((row) => [row.when, row]));
  const shown = PENDING_WHEN_ORDER.filter(
    (when) =>
      when !== "NO_DUE" || active === when || (byWhen.get(when)?.count ?? 0) > 0
  );

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-8",
        shown.length === 4 ? "tablet:grid-cols-4" : "tablet:grid-cols-3"
      )}
      data-tour="pending-counts"
    >
      {shown.map((when) => {
        const row = byWhen.get(when);
        return (
          <StatCard
            key={when}
            label={PENDING_WHEN_LABEL[when]}
            value={row?.count ?? 0}
            tone={countTone(row?.count ?? 0, row?.highCount ?? 0)}
            hint={PENDING_WHEN_HINT[when]}
            active={active === when}
            onClick={() => onToggle(when)}
          />
        );
      })}
    </div>
  );
}
