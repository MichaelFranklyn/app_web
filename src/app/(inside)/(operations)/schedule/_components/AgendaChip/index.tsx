"use client";

import { EventChip } from "@/components/EventChip";

import { canDragItem, writeDrag } from "../../dragItem";
import { VisitScheduleItem } from "../../interface";
import { useVisitActions } from "../../useVisitActions";
import { chipAppearance } from "../../appearance";

interface Props {
  item: VisitScheduleItem;
  dayDate: string;
  /** `sm` no mês: uma linha só. */
  size?: "md" | "sm";
  onChanged: () => void;
}

/**
 * Uma parada da agenda numa linha. O clique abre o mesmo painel do card da
 * rota (com Fui, Não estava, Remarcar…): a linha só resume, as ações são as
 * de sempre. A parada em aberto se arrasta para outro dia.
 */
export function AgendaChip({ item, dayDate, size = "md", onChanged }: Props) {
  const { openView, overlays, isAwaitingSignal } = useVisitActions({
    item,
    dayDate,
    onChanged,
  });
  const look = chipAppearance(item);

  return (
    <>
      {overlays}
      <EventChip
        icon={look.icon}
        tone={look.tone}
        title={look.title}
        detail={look.detail}
        isDone={look.isDone}
        isMuted={look.isMuted}
        size={size}
        label={look.label}
        onClick={openView}
        onDragStart={
          canDragItem(item, isAwaitingSignal)
            ? (e) => writeDrag(e, { itemId: item.id, fromDate: dayDate })
            : undefined
        }
      />
    </>
  );
}
