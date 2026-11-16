"use client";

import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";

import { dayChipLabel } from "../../utils";
import { AlignedNote } from "./AlignedNote";
import { PlanStopSkipReason, WeekPlan } from "./interface";
import { StopBadges } from "./StopBadges";

const SKIP_LABEL: Record<PlanStopSkipReason, string> = {
  ALREADY_SCHEDULED: "já está marcado",
  DUPLICATE: "veio repetido",
  NOT_IN_WALLET: "não está mais na sua carteira",
};

interface Props {
  plan: WeekPlan;
}

/**
 * A semana como vai ficar, dia a dia: o que já estava (apagado), o que a
 * pessoa escolheu ("Novo"), o que o sistema pôs para completar ("Sugerido")
 * e as visitas do outro escritório da pessoa, que pesam no mesmo dia.
 * A distância é a da estrada entre as visitas, para a pessoa sentir o tamanho
 * do dia — a rota de verdade sai depois de gravar.
 */
export function PreviewDays({ plan }: Props) {
  // Dia sem nada vira uma linha só no fim: cinco cartões "nada marcado" só
  // empurravam a semana de verdade para fora da tela.
  const busyDays = plan.days.filter((day) => day.stops.length > 0);
  const freeDays = plan.days.filter((day) => day.stops.length === 0);
  return (
    <div className="flex flex-col gap-12">
      <AlignedNote aligned={plan.aligned} />
      {plan.ignoredDays.length > 0 && (
        <Alert.Root variant="warning">
          <Alert.Content>
            <Alert.Description>
              {plan.ignoredDays.map(dayChipLabel).join(", ")}{" "}
              {plan.ignoredDays.length === 1 ? "ficou" : "ficaram"} de fora: dia
              de folga ou que já passou.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {plan.skipped.length > 0 && (
        <Alert.Root variant="warning">
          <Alert.Content>
            <Alert.Description>
              {plan.skipped
                .map(
                  (s) =>
                    `${s.name} ${SKIP_LABEL[s.reason]}${s.date ? ` (${dayChipLabel(s.date)})` : ""}`
                )
                .join("; ")}
              .
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {busyDays.map((day) => (
        <Card.Root key={day.date} inset tone="muted">
          <Card.Body padding="sm">
            <div className="flex flex-col gap-8">
              <Title variant="label" color="secondary">
                {dayChipLabel(day.date)} · {day.visitCount}{" "}
                {day.visitCount === 1 ? "visita" : "visitas"}
                {day.callCount > 0 &&
                  ` e ${day.callCount} ${day.callCount === 1 ? "ligação" : "ligações"}`}
                {day.estimatedKm
                  ? ` · cerca de ${Math.round(day.estimatedKm)} km entre as visitas`
                  : ""}
              </Title>
              {day.stops.map((stop) => (
                <div
                  key={`${stop.clientId}-${stop.contactType}-${stop.officeName ?? ""}`}
                  className="flex items-center justify-between gap-8"
                >
                  <div className="flex min-w-0 flex-col">
                    <Title
                      variant="body-sm"
                      weight="medium"
                      color={stop.isNew ? "default" : "muted"}
                    >
                      {stop.name}
                    </Title>
                    <Title variant="body-xs" color="muted">
                      {[stop.neighborhood, stop.cityLabel]
                        .filter(Boolean)
                        .join(" · ")}
                    </Title>
                  </div>
                  <StopBadges stop={stop} />
                </div>
              ))}
            </div>
          </Card.Body>
        </Card.Root>
      ))}
      {freeDays.length > 0 && (
        <Title variant="body-xs" color="muted">
          Dias livres:{" "}
          {freeDays.map((day) => dayChipLabel(day.date)).join(", ")}.
        </Title>
      )}
    </div>
  );
}
