"use client";

import { Card } from "@/components/Card";
import { Collapse } from "@/components/Collapse";
import { Title } from "@/components/Title";
import { useState } from "react";

import { PriorityUnavailableClient } from "../../interface";
import { dayChipLabel, UNAVAILABLE_LABEL } from "../../utils";

interface Props {
  clients: PriorityUnavailableClient[];
}

/**
 * Quem não aparece na lista, e por quê. Fica fechado: é para o vendedor que
 * procura um cliente e não acha — saber que foi uma regra, não um sumiço.
 */
export function UnavailableClients({ clients }: Props) {
  const [open, setOpen] = useState(false);
  if (clients.length === 0) return null;

  return (
    <Card.Root>
      <Collapse.Header>
        <Collapse.Trigger
          variant="bar"
          open={open}
          onToggle={() => setOpen((v) => !v)}
        >
          <div className="flex min-w-0 flex-col">
            <Title variant="body-sm" weight="semibold">
              Fora da lista desta semana ({clients.length})
            </Title>
            <Title variant="body-xs" color="muted">
              Pedido esperando entrega, negativado ou pediu para não ser
              procurado agora.
            </Title>
          </div>
        </Collapse.Trigger>
      </Collapse.Header>
      {open && (
        <div className="flex flex-col divide-y divide-(--border)">
          {clients.map((client) => (
            <div
              key={client.clientId}
              className="flex flex-col gap-2 px-16 py-10"
            >
              <Title variant="body-sm" weight="medium">
                {client.name}
              </Title>
              <Title variant="body-xs" color="muted">
                {client.cityLabel} · {UNAVAILABLE_LABEL[client.reason]}
                {client.until && ` até ${dayChipLabel(client.until)}`}
              </Title>
            </div>
          ))}
        </div>
      )}
    </Card.Root>
  );
}
