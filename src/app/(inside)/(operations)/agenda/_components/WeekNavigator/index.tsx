"use client";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { ChevronLeft, ChevronRight, Undo2 } from "lucide-react";

import { RoutineSellerOption } from "../../interface";
import { getWeekMondayIsoFromDate, isoToLocalDate } from "../../utils";
import { PlanWeekLink } from "../PlanWeekLink";

interface Props {
  weekStart: string;
  /** Só para quem escolhe de quem é a agenda (gestor). */
  sellers?: RoutineSellerOption[];
  selectedSellerId?: string | null;
  onSelectSeller?: (id: string) => void;
  onSelectDate: (weekStartIso: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

/**
 * De quem e qual semana, numa linha, e o "Montar semana" logo ao lado. As setas e a data ficam sempre juntas:
 * dentro das ações do cabeçalho, no celular, cada botão caía numa linha.
 * "Voltar para esta semana" só aparece longe dela — desabilitado ao lado da
 * data, ele era um botão a mais sem dizer nada.
 */
export function WeekNavigator({
  weekStart,
  sellers,
  selectedSellerId,
  onSelectSeller,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
}: Props) {
  const isCurrentWeek = weekStart === getCurrentWeekMondayIso();
  const sellerOptions: SelectOption[] = (sellers ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <div
      className="flex flex-wrap items-center gap-8"
      data-tour="routines-week-nav"
    >
      {sellers && (
        <div className="desktop:w-[220px] w-full">
          <Input.Select
            size="sm"
            options={sellerOptions}
            value={
              sellerOptions.find((o) => o.value === selectedSellerId) ?? null
            }
            variant="single"
            disabledClear
            placeholder="Selecionar vendedor"
            onChange={(val: SelectOption | SelectOption[] | null) => {
              const opt = Array.isArray(val) ? val[0] : val;
              if (opt) onSelectSeller?.(opt.value);
            }}
          />
        </div>
      )}
      <div className="desktop:w-auto flex w-full items-center gap-8">
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          isIconOnly
          label="Semana anterior"
          onClick={onPrevWeek}
        >
          <Button.Icon icon={ChevronLeft} />
        </Button.Root>
        <div className="desktop:w-[180px] min-w-0 flex-1">
          <Input.Date
            size="sm"
            variant="single"
            value={isoToLocalDate(weekStart)}
            disabledClear
            placeholder="Escolher semana"
            aria-label="Escolher semana"
            onChange={(date: unknown) => {
              if (date instanceof Date) {
                onSelectDate(getWeekMondayIsoFromDate(date));
              }
            }}
          />
        </div>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          isIconOnly
          label="Próxima semana"
          onClick={onNextWeek}
        >
          <Button.Icon icon={ChevronRight} />
        </Button.Root>
      </div>
      {!isCurrentWeek && (
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          onClick={onCurrentWeek}
        >
          <Button.Icon icon={Undo2} />
          <Button.Title>Voltar para esta semana</Button.Title>
        </Button.Root>
      )}
      {/* A porta principal da agenda, ao lado da semana que ela monta: quem
          escolhe a semana aqui é levado a ela em Montar semana. */}
      <div
        className="desktop:w-auto w-full"
        data-tour="routines-header-actions"
      >
        <PlanWeekLink
          weekStart={weekStart}
          sellerId={selectedSellerId ?? null}
          className="desktop:w-auto w-full"
        />
      </div>
    </div>
  );
}
