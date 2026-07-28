"use client";

import { Badge } from "@/components/Badges";
import { factoryName } from "@/utils/company";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { clientDisplayName } from "@/utils/client";
import { visitPriority } from "@/utils/score";
import { TriangleAlert } from "lucide-react";
import { VisitScheduleDay, VisitScheduleItem } from "../../interface";
import { useVisitActions } from "../../useVisitActions";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  getVisitFollowupWarning,
  getVisitScoreTotal,
} from "../../utils";
import { contactNoun } from "@/utils/visit";
import { ContactLinks } from "../ContactLinks";
import { ContactTypeTag } from "@/components/ContactTypeTag";

interface Props {
  item: VisitScheduleItem;
  currentDayId: string | null;
  scheduleDays: VisitScheduleDay[];
  onChanged: () => void;
}

// Fábricas em foco desta visita, em texto (a visita é ao cliente e pode tratar
// várias fábricas na mesma ida).
const getFocusLabel = (item: VisitScheduleItem): string => {
  const names = (item.focusFactories ?? [])
    .map((focus) => factoryName(focus.factory))
    .filter((name): name is string => Boolean(name));
  if (names.length > 0) return names.join(", ");
  const factory = item.clientFactoryLink?.factory;
  return factoryName(factory);
};

// Uma visita como linha da lista. Compartilha o comportamento do card do kanban
// via useVisitActions: a linha abre o painel de detalhes, o checkbox conclui/
// reabre e o menu cobre as demais ações. Os overlays são renderizados inline
// (fixed) — como no card do kanban — para não sair do container rolável da
// página.
export function VisitRow({
  item,
  currentDayId,
  scheduleDays,
  onChanged,
}: Props) {
  const { openView, toggleCompleted, isToggling, menu, overlays } =
    useVisitActions({ item, currentDayId, scheduleDays, onChanged });

  const isCompleted = item.status === "COMPLETED";
  const isRemote = item.contactType === "REMOTE";
  const noun = contactNoun(item.contactType);
  const client = item.clientFactoryLink?.client ?? null;
  const clientName = clientDisplayName(client);
  const warning = getVisitFollowupWarning(item);
  const scoreValue = getVisitScoreTotal(item);
  const priority = scoreValue != null ? visitPriority(scoreValue) : null;
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
        title={`Visualizar ${noun}`}
        className="flex cursor-pointer items-center gap-12 border-t border-(--border) px-16 py-12 transition-colors hover:bg-(--bg3) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)"
      >
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <InputCheckbox
            tone="green"
            checked={isCompleted}
            disabled={isToggling}
            onChange={(e) => toggleCompleted(e.target.checked)}
            title={
              isCompleted
                ? `Reabrir ${noun}`
                : `Marcar ${noun} como concluíd${isRemote ? "o" : "a"}`
            }
            aria-label={
              isCompleted
                ? `Reabrir ${noun}`
                : `Marcar ${noun} como concluíd${isRemote ? "o" : "a"}`
            }
          />
        </div>

        {/* Tipo + cliente + fábricas em foco. */}
        <div className="min-w-0 flex-1">
          <ContactTypeTag
            contactType={item.contactType}
            className="mb-2 flex"
          />
          <Title
            variant="value"
            color={isCompleted ? "muted" : "default"}
            className={cn("block truncate", isCompleted && "line-through")}
          >
            {clientName}
          </Title>
          <Title
            variant="body-xs"
            color="muted"
            className="mt-2 block truncate"
          >
            {getFocusLabel(item)}
          </Title>
          {isRemote && !isCompleted && (
            <div
              className="mt-8"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <ContactLinks
                contact={client?.primaryContact ?? null}
                clientName={clientName}
              />
            </div>
          )}
        </div>

        {/* Prioridade (só nas pendentes). */}
        {priority && !isCompleted && (
          <div
            className="tablet:flex hidden shrink-0"
            title={`Score ${scoreValue?.toFixed(0)}`}
          >
            <Badge.Root color={priority.tone} appearance="tinted">
              <Badge.Dot />
              <Badge.Text>
                {priority.label} · {scoreValue?.toFixed(0)}
              </Badge.Text>
            </Badge.Root>
          </div>
        )}

        {/* Aviso de follow-up + status. */}
        <div className="flex shrink-0 items-center gap-8">
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

        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {menu}
        </div>
      </div>
    </>
  );
}
