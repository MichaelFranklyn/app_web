"use client";

import { Button } from "@/components/Button";
import { ContactTypeTag } from "@/components/ContactTypeTag";
import { Title } from "@/components/Title";
import { X } from "lucide-react";

import { PriorityClient, WeekSelection } from "../../interface";
import { chosenClients, weekdayShort } from "../../utils";

interface Props {
  selection: WeekSelection;
  clients: PriorityClient[];
  onRemove: (client: PriorityClient) => void;
}

/**
 * Quem o vendedor já escolheu, de todas as cidades, num lugar só. Antes as
 * escolhas ficavam espalhadas pelos cards de cidade e a pessoa montava a
 * semana sem ver a semana.
 */
export function ChosenClients({ selection, clients, onRemove }: Props) {
  const chosen = chosenClients(selection, clients);

  return (
    <div className="flex flex-col gap-8">
      <Title variant="label" color="secondary">
        Escolhidos agora{chosen.length > 0 ? ` (${chosen.length})` : ""}
      </Title>
      {chosen.length === 0 ? (
        <Title variant="body-xs" color="muted">
          Ninguém ainda. Toque nos clientes da lista.
        </Title>
      ) : (
        chosen.map((client) => {
          const choice = selection[client.clientId];
          return (
            <div key={client.clientId} className="flex items-center gap-8">
              <div className="flex min-w-0 flex-1 flex-col">
                <Title variant="body-sm" weight="medium" className="truncate">
                  {client.name}
                </Title>
                <Title variant="body-xs" color="muted">
                  {client.cityLabel}
                  {choice.weekday
                    ? ` · ${weekdayShort(choice.weekday)}`
                    : " · dia pela região"}
                </Title>
              </div>
              <ContactTypeTag contactType={choice.contactType} />
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="sm"
                isIconOnly
                label={`Tirar ${client.name}`}
                onClick={() => onRemove(client)}
              >
                <Button.Icon icon={X} />
              </Button.Root>
            </div>
          );
        })
      )}
    </div>
  );
}
