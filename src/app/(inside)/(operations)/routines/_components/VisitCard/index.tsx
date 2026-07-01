"use client";

import { Badge } from "@/components/Badges";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { TriangleAlert } from "lucide-react";
import { VisitScheduleDay, VisitScheduleItem } from "../../interface";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  VISIT_URGENCY_BORDER,
  getVisitFollowupWarning,
} from "../../utils";
import { UPDATE_VISIT_ITEM_MUTATION } from "../VisitActions/gql";
import { useVisitActions } from "../VisitActions/useVisitActions";

interface Props {
  item: VisitScheduleItem;
  currentDayId: string | null;
  scheduleDays: VisitScheduleDay[];
  onChanged: () => void;
}

interface UpdateItemResponse {
  updateVisitScheduleItem?: { status: boolean; message: string };
}

const getClientName = (item: VisitScheduleItem): string => {
  const client = item.clientFactoryLink?.client;
  if (!client) return "Cliente —";
  return client.nomeFantasia ?? client.razaoSocial;
};

const getFactoryName = (item: VisitScheduleItem): string => {
  const factory = item.clientFactoryLink?.factory;
  if (!factory) return "—";
  return factory.nomeFantasia ?? factory.razaoSocial;
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
        className={`cursor-pointer rounded-(--r-md) border border-(--border) bg-(--bg3) p-[10px] transition-colors hover:border-(--amber) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber) ${VISIT_URGENCY_BORDER[item.status]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-6">
            <div
              className="mt-[1px] shrink-0"
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
              <div
                className={`truncate text-[13px] font-medium ${
                  isCompleted ? "text-(--muted) line-through" : "text-(--text)"
                }`}
              >
                {getClientName(item)}
              </div>
              <div className="truncate text-[13px] text-(--muted)">
                {getFactoryName(item)}
              </div>
            </div>
          </div>
          <div
            className="-mt-[2px] -mr-[4px] shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {menu}
          </div>
        </div>
        <div className="mt-[6px] flex items-center justify-between gap-4">
          <Title variant="micro" color="muted">
            #{item.plannedOrder}
            {item.estimatedTravelMin != null
              ? ` · ${item.estimatedTravelMin}m`
              : ""}
          </Title>
          <div className="flex items-center gap-4">
            {warning && (
              <TriangleAlert
                size={14}
                className="shrink-0 text-(--amber)"
                aria-label={warning.message}
              >
                <title>{warning.message}</title>
              </TriangleAlert>
            )}
            <Badge.Root
              color={VISIT_STATUS_COLOR[item.status]}
              appearance="tinted"
            >
              <Badge.Text>{VISIT_STATUS_LABEL[item.status]}</Badge.Text>
            </Badge.Root>
          </div>
        </div>
      </div>
    </>
  );
}
