"use client";

import { useMemo } from "react";

import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { RowList } from "@/components/RowList";
import { Title } from "@/components/Title";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { plural, pluralWord } from "@/utils/format/plural";

import { formatDistanceKm } from "../../../utils";
import { PriorityClient } from "../../interface";
import { dayChipLabel, FactoryScoreChip, factoryScoreChips } from "../../utils";
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
  /** Os clientes da lista de prioridade: o score por fábrica de cada parada. */
  clients: PriorityClient[];
}

/**
 * A semana como vai ficar, dia a dia: o que já estava (apagado), o que a
 * pessoa escolheu ("Novo"), o que o sistema pôs para completar ("Sugerido")
 * e as visitas do outro escritório da pessoa, que pesam no mesmo dia.
 * A distância é a da estrada entre as visitas, para a pessoa sentir o tamanho
 * do dia — a rota de verdade sai depois de gravar.
 */
export function PreviewDays({ plan, clients }: Props) {
  const { name: currentOffice } = useCompanyBranding();
  // O mesmo tooltip de score de Montar semana nos selos de cada parada. A
  // parada que não está na lista (já marcada, de outro escritório) fica sem.
  const chipsByClient = useMemo(
    () =>
      new Map<string, FactoryScoreChip[]>(
        clients.map((client) => [
          client.clientId,
          factoryScoreChips(client, currentOffice, Infinity).chips,
        ])
      ),
    [clients, currentOffice]
  );
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
              {pluralWord(plan.ignoredDays.length, "ficou", "ficaram")} de fora:
              dia de folga ou que já passou.
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
                {dayChipLabel(day.date)} ·{" "}
                {plural(day.visitCount, "visita", "visitas")}
                {day.callCount > 0 &&
                  ` e ${plural(day.callCount, "ligação", "ligações")}`}
                {day.estimatedKm
                  ? ` · cerca de ${formatDistanceKm(day.estimatedKm, 0)} entre as visitas`
                  : ""}
              </Title>
              {/* Um traço entre um cliente e o seguinte: no celular, com os
                  selos empilhados embaixo do nome, não se via onde um
                  terminava e o outro começava (pedido de 20/11/2026). */}
              <RowList.Root>
                {day.stops.map((stop) => (
                  <RowList.Item
                    key={`${stop.clientId}-${stop.contactType}-${stop.officeName ?? ""}`}
                  >
                    <div
                      // No celular o nome vem em cima e os selos embaixo, um por
                      // linha (como o card da Agenda): lado a lado, os selos de
                      // largura fixa espremiam o nome e saíam da tela (relato de
                      // 20/11/2026 com nome de escritório longo).
                      className="max-desktop:flex-col max-desktop:items-stretch flex items-center justify-between gap-8"
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
                      <StopBadges
                        stop={stop}
                        chips={chipsByClient.get(stop.clientId) ?? []}
                      />
                    </div>
                  </RowList.Item>
                ))}
              </RowList.Root>
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
