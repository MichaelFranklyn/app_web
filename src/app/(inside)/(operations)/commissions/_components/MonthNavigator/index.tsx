"use client";

import { Button } from "@/components/Button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { type CommissionsMonth } from "../../useCommissionsMonth";
import { monthLabel } from "../../utils";

interface Props {
  nav: CommissionsMonth;
}

/** Mês anterior, mês aberto (um toque volta a hoje) e próximo mês. */
export function MonthNavigator({ nav }: Props) {
  const { isCurrentMonth } = nav;

  return (
    <div className="flex items-center gap-4">
      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        isIconOnly
        label="Mês anterior"
        onClick={nav.goPrevious}
      >
        <Button.Icon icon={ChevronLeft} />
      </Button.Root>
      <Button.Root
        appearance={isCurrentMonth ? "tinted" : "ghost"}
        color={isCurrentMonth ? "amber" : "neutral"}
        size="sm"
        noUppercase
        onClick={nav.goToday}
      >
        <Button.Icon icon={CalendarDays} />
        <Button.Title>{monthLabel(nav.month)}</Button.Title>
      </Button.Root>
      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        isIconOnly
        label="Próximo mês"
        onClick={nav.goNext}
      >
        <Button.Icon icon={ChevronRight} />
      </Button.Root>
    </div>
  );
}
