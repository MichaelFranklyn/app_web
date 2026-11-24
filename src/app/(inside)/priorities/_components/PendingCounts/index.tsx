"use client";

import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";

import { PendingWhen, PendingWhenCount } from "../../interface";
import {
  countStatus,
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
 * prioridade alta; zero em cinza. "Sem prazo" só aparece quando há cadastro a corrigir — um
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
        // Três contadores cabem numa linha até no celular: em 2 colunas o
        // terceiro ia sozinho para baixo, esticado, e a fileira — que só
        // funciona lida de um golpe — virava duas. Quatro seguem 2 × 2.
        "grid gap-8",
        shown.length === 4 ? "tablet:grid-cols-4 grid-cols-2" : "grid-cols-3"
      )}
      data-tour="pending-counts"
    >
      {shown.map((when) => {
        const row = byWhen.get(when);
        return (
          <Card.Kpi
            key={when}
            onClick={() => onToggle(when)}
            active={active === when}
            title={PENDING_WHEN_HINT[when]}
            // No celular, a terça parte da tela não comporta o respiro de 20px.
            className="max-tablet:px-12 max-tablet:py-12"
          >
            <Card.Kpi.Label>{PENDING_WHEN_LABEL[when]}</Card.Kpi.Label>
            <Card.Kpi.Value
              status={countStatus(row?.count ?? 0, row?.highCount ?? 0)}
            >
              {row?.count ?? 0}
            </Card.Kpi.Value>
          </Card.Kpi>
        );
      })}
    </div>
  );
}
