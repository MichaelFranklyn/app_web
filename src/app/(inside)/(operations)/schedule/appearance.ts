import { EventChipTone } from "@/components/EventChip";
import { clientDisplayName } from "@/utils/client";
import { contactLabel, VISIT_STATUS_LABEL } from "@/utils/visit";
import { Car, LucideIcon, Phone } from "lucide-react";

import { itemClient } from "./calendar";
import { VisitScheduleItem } from "./interface";

export interface ChipAppearance {
  icon: LucideIcon;
  tone: EventChipTone;
  title: string;
  detail: string | null;
  isDone: boolean;
  isMuted: boolean;
  label: string;
}

/**
 * Como uma parada aparece numa linha da agenda.
 *
 * A COR diz o tipo — visita (âmbar) ou ligação (azul) — porque é isso que a
 * pessoa procura ao bater o olho na semana. A linha de apoio diz o que a cor
 * não diz: o motivo de quem marcou, ou que o compromisso saiu do previsto
 * (ausente, remarcado…).
 */
export const chipAppearance = (item: VisitScheduleItem): ChipAppearance => {
  const isRemote = item.contactType === "REMOTE";
  const title = clientDisplayName(itemClient(item));
  const isDone = item.status === "COMPLETED";
  const isMuted = !isDone && item.status !== "PENDING";
  const kind = contactLabel(item.contactType);

  const detail = isMuted
    ? VISIT_STATUS_LABEL[item.status]
    : (item.reason ?? null);

  return {
    icon: isRemote ? Phone : Car,
    tone: isRemote ? "blue" : "amber",
    title,
    detail,
    isDone,
    isMuted,
    label: `${kind} — ${title}${isDone ? " (feito)" : ""}. Abrir detalhes`,
  };
};
