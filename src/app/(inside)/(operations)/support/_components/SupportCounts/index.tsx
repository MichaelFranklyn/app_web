"use client";

import { Card } from "@/components/Card";
import type { KpiStatus } from "@/components/Card/Kpi";
import { SUPPORT_STATUS_LABEL, SupportStatus } from "@/utils/support";

import { SupportCountsData } from "../../interface";

interface Props {
  data?: SupportCountsData;
}

/**
 * Os números do topo, na ordem de quem tem a bola: primeiro o que ninguém
 * assumiu, depois o que está andando, depois o que espera terceiros.
 *
 * Resolvido e cancelado ficam de fora: a fila existe para o que falta fazer, e
 * um cartão de "resolvidos" no topo só empurra os outros para baixo.
 */
const SHOWN: { status: SupportStatus; tone: KpiStatus }[] = [
  { status: "OPEN", tone: "urgente" },
  { status: "IN_PROGRESS", tone: "atencao" },
  { status: "WAITING_FACTORY", tone: "info" },
  { status: "WAITING_CLIENT", tone: "info" },
];

export function SupportCounts({ data }: Props) {
  const byStatus = new Map(
    (data?.clientSupportCounts ?? []).map((row) => [row.status, row.count])
  );

  return (
    <div
      className="tablet:grid-cols-4 grid grid-cols-2 gap-8"
      data-tour="support-counts"
    >
      {SHOWN.map(({ status, tone }) => (
        <Card.Kpi key={status}>
          <Card.Kpi.Label>{SUPPORT_STATUS_LABEL[status]}</Card.Kpi.Label>
          <Card.Kpi.Value
            status={(byStatus.get(status) ?? 0) > 0 ? tone : "neutral"}
          >
            {byStatus.get(status) ?? 0}
          </Card.Kpi.Value>
        </Card.Kpi>
      ))}
    </div>
  );
}
