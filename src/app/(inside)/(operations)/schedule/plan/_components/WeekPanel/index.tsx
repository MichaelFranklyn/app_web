"use client";

import { Card } from "@/components/Card";

import { PriorityClient, WeekSelection } from "../../interface";
import { selectionCounts, selectionPhrase } from "../../utils";
import { ChosenClients } from "../ChosenClients";
import { PlanSteps } from "../PlanSteps";
import { ScheduledVisits } from "../ScheduledVisits";

interface Props {
  selection: WeekSelection;
  clients: PriorityClient[];
  onRemove: (client: PriorityClient) => void;
  onOrganize: () => void;
  sellerId: string | null;
  /** Gestor ainda sem vendedor escolhido: as visitas marcadas esperam. */
  awaitingSeller: boolean;
  scheduleSellerId: string | null;
  onScheduled: () => void;
}

/**
 * "Sua semana": o que fazer agora, quem já foi escolhido e o que já estava
 * marcado, ao lado da lista. No desktop acompanha a rolagem — o vendedor vê a
 * semana crescer enquanto escolhe, em qualquer cidade.
 */
export function WeekPanel({
  selection,
  clients,
  onRemove,
  onOrganize,
  sellerId,
  awaitingSeller,
  scheduleSellerId,
  onScheduled,
}: Props) {
  return (
    <Card.Root>
      <Card.Section>
        <PlanSteps
          chosen={selectionCounts(selection).total}
          chosenPhrase={selectionPhrase(selection)}
          onOrganize={onOrganize}
          onLetSystemChoose={onOrganize}
        />
      </Card.Section>
      <Card.Section divided>
        <ChosenClients
          selection={selection}
          clients={clients}
          onRemove={onRemove}
        />
      </Card.Section>
      <Card.Section divided>
        <ScheduledVisits
          sellerId={sellerId}
          skip={awaitingSeller}
          scheduleSellerId={scheduleSellerId}
          onScheduled={onScheduled}
        />
      </Card.Section>
    </Card.Root>
  );
}
