"use client";

import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { visitPriority } from "@/utils/score";
import { AlertTriangle } from "lucide-react";

import { TripPlan, TripVisit } from "../interface";
import { plannedVisitCount, tripDayLabel } from "../utils";
import { TripLeftOut } from "../TripLeftOut";

interface Props {
  plan: TripPlan;
}

function VisitLine({ visit }: { visit: TripVisit }) {
  const priority = visitPriority(visit.score);
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="flex min-w-0 flex-col">
        <Title variant="body-sm" weight="medium">
          {visit.clientName}
        </Title>
        <Title variant="body-xs" color="muted">
          {visit.city}
        </Title>
      </div>
      <Badge.Root
        color={priority.tone}
        appearance="tinted"
        title="Urgência do cliente hoje. Na viagem todos da região entram, do mais urgente ao menos urgente."
      >
        <Badge.Text>{priority.label}</Badge.Text>
      </Badge.Root>
    </div>
  );
}

/**
 * A prévia do plano: o que cai em cada dia e o que ficou de fora.
 *
 * Dia a dia, porque é assim que o vendedor organiza a viagem ("terça fico em
 * Feira, quarta subo para Serrinha"); e o que ficou de fora vem com o motivo,
 * porque cada motivo tem uma saída diferente.
 */
export function TripPreview({ plan }: Props) {
  const visits = plannedVisitCount(plan);

  return (
    <div className="flex flex-col gap-12">
      <Alert.Root variant="info">
        <Alert.Content>
          <Alert.Title>
            {visits === 1 ? "1 visita" : `${visits} visitas`} em{" "}
            {plan.days.length === 1 ? "1 dia" : `${plan.days.length} dias`}
          </Alert.Title>
          <Alert.Description>
            {plan.regionClientCount} cliente(s) da carteira nessas cidades.
            Nesses dias, as visitas que a rotina tinha marcado perto de casa
            saem; as ligações continuam.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      {plan.manualConflicts > 0 && (
        <Alert.Root variant="warning">
          <AlertTriangle size={14} className="mt-[1px] shrink-0" />
          <Alert.Content>
            <Alert.Description>
              {plan.manualConflicts} visita(s) marcada(s) à mão continuam nesses
              dias. Confira na rotina se ainda dá para fazer ou remarque.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {plan.days.map((day) => (
        <Card.Root key={day.date} inset tone="muted">
          <Card.Body padding="sm">
            <div className="flex flex-col gap-8">
              <Title variant="label" color="secondary">
                {tripDayLabel(day.date)}
                {day.city ? ` · sai de ${day.city}` : ""}
              </Title>
              {day.visits.length === 0 ? (
                <Title variant="body-sm" color="muted">
                  Nenhum cliente coube neste dia.
                </Title>
              ) : (
                day.visits.map((visit) => (
                  <VisitLine key={visit.clientId} visit={visit} />
                ))
              )}
            </div>
          </Card.Body>
        </Card.Root>
      ))}

      <TripLeftOut plan={plan} />
    </div>
  );
}
