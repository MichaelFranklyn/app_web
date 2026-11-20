import { DragEvent } from "react";

import { VisitScheduleItem } from "./interface";

/**
 * Arrastar um compromisso de um dia para outro, como no Google Agenda.
 *
 * O dado viaja no próprio `dataTransfer` (e não num estado da tela) porque a
 * semana e o mês são grades independentes: quem solta não precisa conhecer
 * quem arrastou. O tipo próprio impede que um texto ou arquivo arrastado de
 * fora acenda a célula como destino.
 */
export const AGENDA_DRAG_TYPE = "application/x-agenda-item";

export interface AgendaDrag {
  itemId: string;
  fromDate: string;
}

/** Só a parada ainda em aberto muda de dia — a que já teve desfecho é história. */
export const canDragItem = (
  item: Pick<VisitScheduleItem, "status">,
  isAwaitingSignal: boolean
): boolean => item.status === "PENDING" && !isAwaitingSignal;

export const writeDrag = (event: DragEvent, drag: AgendaDrag) => {
  event.dataTransfer.setData(AGENDA_DRAG_TYPE, JSON.stringify(drag));
  event.dataTransfer.effectAllowed = "move";
};

export const readDrag = (raw: string): AgendaDrag | null => {
  try {
    const data = JSON.parse(raw) as Partial<AgendaDrag>;
    return data.itemId && data.fromDate
      ? { itemId: data.itemId, fromDate: data.fromDate }
      : null;
  } catch {
    return null;
  }
};
