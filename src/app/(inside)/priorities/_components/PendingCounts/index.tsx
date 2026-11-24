"use client";

import { Card } from "@/components/Card";

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
    // Colunas pela regra única do DS (Card.Kpi.Group): 2 × 2 no celular, e com
    // três o último ocupa a linha toda em vez de espremer três terços.
    <Card.Kpi.Group data-tour="pending-counts">
      {shown.map((when) => {
        const row = byWhen.get(when);
        return (
          <Card.Kpi
            key={when}
            onClick={() => onToggle(when)}
            active={active === when}
            title={PENDING_WHEN_HINT[when]}
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
    </Card.Kpi.Group>
  );
}
