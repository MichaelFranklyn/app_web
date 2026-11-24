"use client";

import { Card } from "@/components/Card";
import type { KpiStatus } from "@/components/Card/Kpi";
import { SUPPORT_STATUS_HINT, SupportStatus } from "@/utils/support";

import { SupportCountsData } from "../../interface";

interface Props {
  data?: SupportCountsData;
  /** A situação filtrada na lista agora, se houver. */
  active?: string;
  /** Clicar no cartão filtra a lista por aquela situação; de novo, limpa. */
  onToggle: (status: SupportStatus) => void;
}

/**
 * Os números do topo, na ordem de quem tem a bola: primeiro o que ninguém
 * assumiu, depois o que está andando, depois o que espera terceiros.
 *
 * Resolvido e cancelado ficam de fora: a fila existe para o que falta fazer, e
 * um cartão de "resolvidos" no topo só empurra os outros para baixo.
 *
 * Cada cartão é um filtro (crítica de 23/11/2026): parecia clicável e não
 * fazia nada. O rótulo é o da FILA, no plural ("Abertas"), e não o da tarja
 * da linha ("Aberto").
 */
const SHOWN: { status: SupportStatus; label: string; tone: KpiStatus }[] = [
  { status: "OPEN", label: "Abertas", tone: "urgente" },
  { status: "IN_PROGRESS", label: "Em andamento", tone: "atencao" },
  { status: "WAITING_FACTORY", label: "Aguardando a fábrica", tone: "info" },
  { status: "WAITING_CLIENT", label: "Aguardando o cliente", tone: "info" },
];

export function SupportCounts({ data, active, onToggle }: Props) {
  const byStatus = new Map(
    (data?.clientSupportCounts ?? []).map((row) => [row.status, row.count])
  );

  // Fila vazia: quatro zeros não dizem nada que o estado vazio da lista já
  // não diga, e empurravam a lista para baixo no celular.
  const allZero = SHOWN.every(({ status }) => !byStatus.get(status));
  if (!data || (allZero && !active)) return null;

  return (
    <Card.Kpi.Group data-tour="support-counts">
      {SHOWN.map(({ status, label, tone }) => {
        const count = byStatus.get(status) ?? 0;
        return (
          <Card.Kpi
            key={status}
            onClick={() => onToggle(status)}
            active={active === status}
            title={SUPPORT_STATUS_HINT[status]}
          >
            <Card.Kpi.Label>{label}</Card.Kpi.Label>
            <Card.Kpi.Value status={count > 0 ? tone : "muted"}>
              {count}
            </Card.Kpi.Value>
          </Card.Kpi>
        );
      })}
    </Card.Kpi.Group>
  );
}
