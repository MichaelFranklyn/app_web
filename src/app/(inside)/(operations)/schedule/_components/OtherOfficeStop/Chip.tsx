"use client";

import { EventChip } from "@/components/EventChip";
import { contactLabel, VISIT_STATUS_LABEL } from "@/utils/visit";
import { toTitleCase } from "@/utils/format/titleCase";
import { Car, Phone } from "lucide-react";

import { CrossOfficeStop } from "../../interface";

interface Props {
  stop: CrossOfficeStop;
  size?: "md" | "sm";
  /** Abre o dia, onde o cartão dá as ações. */
  onOpen: () => void;
}

/** A parada do outro escritório numa linha do mês. */
export function OtherOfficeStopChip({ stop, size = "sm", onOpen }: Props) {
  const isRemote = stop.contactType === "REMOTE";
  const isDone = stop.status === "COMPLETED";
  const isMuted = !isDone && stop.status !== "PENDING";
  const clientName = toTitleCase(stop.clientName);
  return (
    <EventChip
      icon={isRemote ? Phone : Car}
      tone={isRemote ? "blue" : "amber"}
      title={clientName}
      detail={isMuted ? VISIT_STATUS_LABEL[stop.status] : stop.officeName}
      isDone={isDone}
      isMuted={isMuted}
      size={size}
      label={`${contactLabel(stop.contactType)} no ${stop.officeName} — ${clientName}${isDone ? " (feito)" : ""}. Abrir o dia`}
      onClick={onOpen}
    />
  );
}
