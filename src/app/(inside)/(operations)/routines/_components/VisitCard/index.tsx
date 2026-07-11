"use client";

import { Badge } from "@/components/Badges";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientDisplayName } from "@/utils/client";
import { visitPriority } from "@/utils/score";
import { VisitScheduleDay, VisitScheduleItem } from "../../interface";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  getVisitFollowupWarning,
  getVisitScoreTotal,
} from "../../utils";
import { UPDATE_VISIT_ITEM_MUTATION } from "../../gql";
import { useVisitActions } from "../../useVisitActions";

interface Props {
  item: VisitScheduleItem;
  currentDayId: string | null;
  scheduleDays: VisitScheduleDay[];
  onChanged: () => void;
}

interface UpdateItemResponse {
  updateVisitScheduleItem?: { status: boolean; message: string };
}

const getFactoryName = (item: VisitScheduleItem): string => {
  const factory = item.clientFactoryLink?.factory;
  if (!factory) return "—";
  return factory.nomeFantasia ?? factory.razaoSocial;
};

// Quantos nomes de fábrica cabem sem espremer o card; o resto vira "+N".
const FACTORY_NAMES_SHOWN = 2;

/**
 * As fábricas que esta visita vai tratar. Uma visita cobre o cliente inteiro:
 * se duas fábricas dele estão urgentes, o vendedor conversa sobre as duas na
 * mesma ida — por isso o card lista os nomes em vez de uma fábrica só.
 */
const getFocusLabel = (item: VisitScheduleItem): string => {
  const names = (item.focusFactories ?? [])
    .map((focus) => focus.factory?.nomeFantasia ?? focus.factory?.razaoSocial)
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) return getFactoryName(item);

  const shown = names.slice(0, FACTORY_NAMES_SHOWN).join(", ");
  const rest = names.length - FACTORY_NAMES_SHOWN;
  return rest > 0 ? `${shown} +${rest}` : shown;
};

// Card de uma visita na grade semanal. O card inteiro é clicável e abre o
// painel lateral de detalhes; o checkbox é um atalho para concluir/reabrir a
// visita e o menu de três pontos cobre as demais ações. Os controles têm o
// clique isolado (stopPropagation) para não dispararem o painel.
export function VisitCard({
  item,
  currentDayId,
  scheduleDays,
  onChanged,
}: Props) {
  const { openView, promptAfterComplete, menu, overlays } = useVisitActions({
    item,
    currentDayId,
    scheduleDays,
    onChanged,
  });

  const [updateItem] = useMutation<UpdateItemResponse>(
    UPDATE_VISIT_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const isCompleted = item.status === "COMPLETED";
  const warning = getVisitFollowupWarning(item);
  const scoreValue = getVisitScoreTotal(item);
  const priority = scoreValue != null ? visitPriority(scoreValue) : null;

  const toggleCompleted = (checked: boolean) => {
    execute(
      async () => {
        const res = await updateItem({
          variables: {
            id: item.id,
            input: { status: checked ? "COMPLETED" : "PENDING" },
          },
        });
        const payload = res.data?.updateVisitScheduleItem;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao atualizar visita");
        }
        return payload;
      },
      {
        successMessage: checked ? "Visita concluída" : "Visita reaberta",
        onSuccess: () => {
          onChanged();
          // Ao concluir, oferece registrar o pedido ou o estoque do cliente.
          if (checked) promptAfterComplete();
        },
      }
    );
  };

  // "Pendente" é o estado esperado de toda visita futura — mostrar o badge em
  // cada card só polui a coluna. Ele aparece quando a visita saiu do previsto
  // (realizada, ausente, remarcada…), que é a informação que vale destacar.
  const showStatusBadge = item.status !== "PENDING";

  return (
    <>
      {overlays}
      <div
        role="button"
        tabIndex={0}
        onClick={openView}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openView();
          }
        }}
        title="Visualizar visita"
        className="cursor-pointer rounded-(--r-md) border border-(--border) bg-(--bg3) p-16 transition-colors hover:border-(--amber) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)"
      >
        <div className="flex items-start justify-between gap-8">
          <div className="flex min-w-0 items-start gap-8">
            <div
              className="mt-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <InputCheckbox
                tone="green"
                checked={isCompleted}
                disabled={isLoading}
                onChange={(e) => toggleCompleted(e.target.checked)}
                title={
                  isCompleted
                    ? "Reabrir visita"
                    : "Marcar visita como concluída"
                }
                aria-label={
                  isCompleted
                    ? "Reabrir visita"
                    : "Marcar visita como concluída"
                }
              />
            </div>
            <div className="min-w-0">
              <Title
                variant="value"
                color={isCompleted ? "muted" : "default"}
                className={cn("block truncate", isCompleted && "line-through")}
              >
                {clientDisplayName(item.clientFactoryLink?.client)}
              </Title>
              <Title
                variant="body-xs"
                color="muted"
                className="mt-2 block truncate"
              >
                {getFocusLabel(item)}
              </Title>
            </div>
          </div>
          <div
            className="-mt-2 -mr-4 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {menu}
          </div>
        </div>

        {priority && !isCompleted && (
          <div className="mt-12 flex" title={`Score ${scoreValue?.toFixed(0)}`}>
            <Badge.Root color={priority.tone} appearance="tinted">
              <Badge.Dot />
              <Badge.Text>
                {priority.label} · {scoreValue?.toFixed(0)}
              </Badge.Text>
            </Badge.Root>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between gap-8 border-t border-(--border) pt-12">
          <Title variant="micro" color="muted">
            #{item.plannedOrder}
            {item.estimatedTravelMin != null
              ? ` · ${item.estimatedTravelMin}m`
              : ""}
          </Title>
          <div className="flex items-center gap-8">
            {warning && (
              <TriangleAlert
                size={14}
                className="shrink-0 text-(--amber)"
                aria-label={warning.message}
              >
                <title>{warning.message}</title>
              </TriangleAlert>
            )}
            {showStatusBadge && (
              <Badge.Root
                color={VISIT_STATUS_COLOR[item.status]}
                appearance="tinted"
              >
                <Badge.Text>{VISIT_STATUS_LABEL[item.status]}</Badge.Text>
              </Badge.Root>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
