"use client";

import { Title } from "@/components/Title";
import { formatDateDMY } from "@/utils/format/masks";

import { TripPlan, TripVisit } from "../interface";

interface Props {
  plan: TripPlan;
}

function Group({
  title,
  hint,
  visits,
}: {
  title: string;
  hint: string;
  visits: TripVisit[];
}) {
  if (visits.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <Title variant="label" color="secondary">
        {title} ({visits.length})
      </Title>
      <Title variant="body-xs" color="muted">
        {hint}
      </Title>
      <Title variant="body-sm">
        {visits.map((visit) => visit.clientName).join(", ")}
      </Title>
    </div>
  );
}

/**
 * Quem da região NÃO entrou na viagem, separado pelo motivo — cada um tem uma
 * saída diferente, e a pessoa precisa saber qual é a dela.
 */
export function TripLeftOut({ plan }: Props) {
  return (
    <div className="flex flex-col gap-12">
      <Group
        title="Não couberam nos dias"
        hint="Os dias encheram (vagas por dia ou horário de trabalho). Aumente o período ou marque à mão."
        visits={plan.leftOut}
      />
      <Group
        title="Sem endereço no mapa"
        hint="Sem localização não há rota até eles. Corrija o endereço no cadastro do cliente."
        visits={plan.ungeocoded}
      />
      <Group
        title="Já têm visita marcada"
        hint="Estes clientes já estão na rotina em outro dia."
        visits={plan.alreadyScheduled}
      />
      {plan.unavailableCount > 0 && (
        <Title variant="body-xs" color="muted">
          {plan.unavailableCount} cliente(s) ficaram fora pelas regras da
          rotina: pedido ainda não entregue, cliente negativado na fábrica ou
          que pediu para não ser visitado agora.
        </Title>
      )}
      {plan.skippedDates.length > 0 && (
        <Title variant="body-xs" color="muted">
          Dias que já começaram na rotina não entram:{" "}
          {plan.skippedDates.map((date) => formatDateDMY(date)).join(", ")}.
        </Title>
      )}
    </div>
  );
}
