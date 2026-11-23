"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { Link2, Printer } from "lucide-react";
import { useState } from "react";

import { VisitScheduleDay } from "../../interface";
import { ResponseLinkModal } from "../ResponseLinkModal";
import { usePrintWeek } from "./usePrintWeek";

interface Props {
  scheduleId: string;
  weekStart: string;
  /** "semana de 17 – 23/11" — o período no link de resposta. */
  weekLabel: string;
  days: VisitScheduleDay[];
  sellerName: string | null;
  dayOffDates: string[];
}

/**
 * A folha da semana e o link de resposta num menu só, como no dia: dois
 * botões soltos acima da grade disputavam atenção com o "Agendar" e, no
 * celular, ocupavam uma linha inteira (crítica de 23/11/2026).
 */
export function WeekMoreMenu({
  scheduleId,
  weekStart,
  weekLabel,
  days,
  sellerName,
  dayOffDates,
}: Props) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const { print, isBusy, isEmpty } = usePrintWeek({
    scheduleId,
    weekStart,
    days,
    sellerName,
    dayOffDates,
  });

  const options: MoreOption[] = [
    {
      label: isBusy ? "Gerando a folha…" : "Imprimir semana",
      icon: Printer,
      disabled: isEmpty || isBusy,
      onClick: () => void print(),
    },
    {
      label: "Link de resposta",
      icon: Link2,
      disabled: isEmpty,
      onClick: () => setIsLinkOpen(true),
    },
  ];

  return (
    <>
      <MoreOptions options={options} label="Mais ações da semana" showLabel />
      <ResponseLinkModal
        scope={{ kind: "week", scheduleId }}
        dateLabel={weekLabel}
        isEmpty={isEmpty}
        open={isLinkOpen}
        onOpenChange={setIsLinkOpen}
      />
    </>
  );
}
