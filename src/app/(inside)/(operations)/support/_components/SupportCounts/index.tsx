"use client";

import { StatCard } from "@/components/StatCard";
import { TitleColor } from "@/components/Title";
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
const SHOWN: { status: SupportStatus; tone: TitleColor }[] = [
  { status: "OPEN", tone: "red" },
  { status: "IN_PROGRESS", tone: "amber" },
  { status: "WAITING_FACTORY", tone: "blue" },
  { status: "WAITING_CLIENT", tone: "blue" },
];

export function SupportCounts({ data }: Props) {
  const byStatus = new Map(
    (data?.clientSupportCounts ?? []).map((row) => [row.status, row.count])
  );

  return (
    <div className="tablet:grid-cols-4 grid grid-cols-2 gap-8">
      {SHOWN.map(({ status, tone }) => (
        <StatCard
          key={status}
          label={SUPPORT_STATUS_LABEL[status]}
          value={byStatus.get(status) ?? 0}
          tone={tone}
        />
      ))}
    </div>
  );
}
