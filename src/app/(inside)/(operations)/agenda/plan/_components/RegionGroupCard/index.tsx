"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { VisitContactType } from "@/utils/visit";

import { PriorityClient, RegionGroup, WeekSelection } from "../../interface";
import { PriorityClientRow } from "../PriorityClientRow";

interface Props {
  group: RegionGroup;
  selection: WeekSelection;
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
 *
 * Sempre aberto (desde 18/10/2026): fechado da 4ª cidade em diante, o cliente
 * urgente de uma cidade pequena só aparecia para quem abria o card. Para ir
 * direto a uma cidade, o filtro de cidade da barra de cima.
 */
export function RegionGroupCard({
  group,
  selection,
  onToggle,
  onToggleMany,
  onContactTypeChange,
  onWeekdayChange,
}: Props) {
  const chosen = group.clients.filter((c) => selection[c.clientId]).length;
  const allChosen = chosen === group.clients.length;
  const count = group.clients.length;

  return (
    <Card.Root>
      <Card.Header>
        <Card.HeaderTitle>{group.label}</Card.HeaderTitle>
        <Card.HeaderDescription>
          {count} {count === 1 ? "cliente" : "clientes"}
          {group.topCount > 0 && ` · ${group.topCount} com prioridade máxima`}
          {chosen > 0 && ` · ${chosen} escolhido${chosen === 1 ? "" : "s"}`}
        </Card.HeaderDescription>
        <Card.HeaderActions>
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
        </Card.HeaderActions>
      </Card.Header>
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
    </Card.Root>
  );
}
