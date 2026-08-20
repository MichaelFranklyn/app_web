"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { SelectOption } from "@/components/Input";
import { Progress } from "@/components/Progress";
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { Pencil, Trash2 } from "lucide-react";

import { GoalRow } from "../../../interface";
import {
  GOAL_METRICS,
  metricValues,
  overallPercent,
  percentOf,
  percentTone,
} from "../../../utils";
import { SetGoalModal } from "../../../_components/SetGoalModal";

interface Props {
  row: GoalRow;
  periodMonthIso: string;
  /** Gestor: ajusta e remove a meta desta fábrica. Vendedor só acompanha. */
  canManage: boolean;
  sellerOptions: SelectOption[];
  factoryOptions: SelectOption[];
  onRemove: (row: GoalRow) => Promise<void>;
  onChanged: () => void;
}

/**
 * Uma fábrica do vendedor no mês: o combinado, o realizado e o botão de mexer
 * nele.
 *
 * A fábrica é a unidade em que a cota é negociada — é aqui que o gestor decide.
 * Por isso cada uma ganha o próprio cartão, com a ação de editar do lado do
 * número que ela mostra, em vez de uma lista de barras que só se lê rolando.
 */
export function FactoryGoalCard({
  row,
  periodMonthIso,
  canManage,
  sellerOptions,
  factoryOptions,
  onRemove,
  onChanged,
}: Props) {
  const totals = Object.fromEntries(
    GOAL_METRICS.map((metric) => [metric.id, metricValues(row, metric.id)])
  );
  const overall = overallPercent(
    totals as Parameters<typeof overallPercent>[0]
  );

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          {factoryName(row.factory)}
        </Card.Header.Title>
        <Card.Header.Actions>
          {/* Vendeu sem meta combinada: o convite para definir uma. */}
          {!row.goalId && (
            <Badge.Root appearance="tinted" color="neutral" size="xs">
              <Badge.Text>Sem meta</Badge.Text>
            </Badge.Root>
          )}
          {canManage && (
            <>
              <SetGoalModal
                periodMonthIso={periodMonthIso}
                row={row}
                sellerOptions={sellerOptions}
                factoryOptions={factoryOptions}
                onSaved={onChanged}
                trigger={
                  <Button.Root
                    appearance="ghost"
                    color="neutral"
                    size="sm"
                    isIconOnly
                    label={row.goalId ? "Ajustar meta" : "Definir meta"}
                  >
                    <Button.Icon icon={Pencil} />
                  </Button.Root>
                }
              />
              {row.goalId && (
                <ConfirmModal
                  title="Remover a meta desta fábrica?"
                  description="O acompanhamento do mês fica sem número combinado para esta fábrica. O que já foi vendido não muda."
                  confirmLabel="Remover meta"
                  onConfirm={() => onRemove(row)}
                  successMessage="Meta removida"
                  trigger={
                    <Button.Root
                      appearance="ghost"
                      color="red"
                      size="sm"
                      isIconOnly
                      label="Remover meta"
                    >
                      <Button.Icon icon={Trash2} />
                    </Button.Root>
                  }
                />
              )}
            </>
          )}
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body padding="compact">
        {/* O quanto desta fábrica já foi cumprido, no topo: é a resposta curta,
            e os quatro indicadores abaixo dizem de onde ela vem. */}
        {overall !== null && (
          <div className="mb-12 flex flex-col gap-4">
            <Title
              variant="body-xs"
              weight="semibold"
              color={percentTone(overall)}
            >
              {overall.toFixed(0)}% da meta
            </Title>
            <Progress.Bar
              value={Math.min(overall, 100)}
              color={percentTone(overall)}
            />
          </div>
        )}

        <div className="flex flex-col gap-8">
          {GOAL_METRICS.map((metric) => {
            const values = totals[metric.id];
            const percent = percentOf(values);
            const format = (value: number) =>
              metric.money ? formatMoney(value) : formatNumber(value);

            return (
              <div
                key={metric.id}
                className="flex flex-wrap items-baseline justify-between gap-8"
                title={metric.help}
              >
                <Title variant="body-xs" color="muted">
                  {metric.label}
                </Title>
                <div className="flex flex-wrap items-baseline gap-4">
                  <Title variant="body-sm" weight="medium">
                    {format(values.done)}
                  </Title>
                  {/* Sem meta não vira "0%": leria como atraso de quem nunca
                      teve alvo combinado. */}
                  {values.target === null ? (
                    <Title variant="body-xs" color="muted">
                      · sem meta
                    </Title>
                  ) : (
                    <Title variant="body-xs" color={percentTone(percent)}>
                      · {percent?.toFixed(0)}% de {format(values.target)}
                    </Title>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
