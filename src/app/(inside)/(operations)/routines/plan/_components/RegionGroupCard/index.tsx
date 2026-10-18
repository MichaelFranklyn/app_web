"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Collapse } from "@/components/Collapse";
import { Title } from "@/components/Title";
import type { VisitContactType } from "@/utils/visit";
import { useState } from "react";

import { PriorityClient, RegionGroup, WeekSelection } from "../../interface";
import { PriorityClientRow } from "../PriorityClientRow";

interface Props {
  group: RegionGroup;
  selection: WeekSelection;
  /** Abre já expandido (as cidades com cliente no topo da fila). */
  defaultOpen: boolean;
  onToggle: (client: PriorityClient) => void;
  onToggleMany: (clients: PriorityClient[], on: boolean) => void;
  onContactTypeChange: (
    clientId: string,
    contactType: VisitContactType
  ) => void;
  onWeekdayChange: (clientId: string, weekday: number | null) => void;
}

/**
 * Os clientes de uma cidade. É a unidade em que o vendedor pensa a semana
 * ("terça eu faço Camaçari"), por isso "Escolher todos" vale para o grupo.
 */
export function RegionGroupCard({
  group,
  selection,
  defaultOpen,
  onToggle,
  onToggleMany,
  onContactTypeChange,
  onWeekdayChange,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const chosen = group.clients.filter((c) => selection[c.clientId]).length;
  const allChosen = chosen === group.clients.length;
  const count = group.clients.length;

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
              {group.label}
            </Title>
            <Title variant="body-xs" color="muted">
              {count} {count === 1 ? "cliente" : "clientes"}
              {group.topCount > 0 &&
                ` · ${group.topCount} com prioridade máxima`}
              {chosen > 0 && ` · ${chosen} escolhido${chosen === 1 ? "" : "s"}`}
            </Title>
          </div>
        </Collapse.Trigger>
        <div className="flex items-center pr-12">
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            noUppercase
            onClick={() => onToggleMany(group.clients, !allChosen)}
          >
            <Button.Title>
              {allChosen ? "Tirar todos" : "Escolher todos"}
            </Button.Title>
          </Button.Root>
        </div>
      </Collapse.Header>
      {open && (
        <div className="flex flex-col divide-y divide-(--border)">
          {group.clients.map((client) => (
            <PriorityClientRow
              key={client.clientId}
              client={client}
              choice={selection[client.clientId]}
              onToggle={() => onToggle(client)}
              onContactTypeChange={(type) =>
                onContactTypeChange(client.clientId, type)
              }
              onWeekdayChange={(weekday) =>
                onWeekdayChange(client.clientId, weekday)
              }
            />
          ))}
        </div>
      )}
    </Card.Root>
  );
}
