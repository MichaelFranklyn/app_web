"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { PanelHeader } from "@/components/PanelHeader";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { RoutineSellerOption, VisitScheduleSeller } from "../../interface";
import { getCurrentWeekMondayIso } from "@/utils/format/date";
import {
  formatWeekRange,
  getIsoWeekNumber,
  getWeekMondayIsoFromDate,
  isoToLocalDate,
} from "../../utils";

interface Props {
  weekStart: string;
  seller: VisitScheduleSeller | null;
  sellers?: RoutineSellerOption[];
  selectedSellerId?: string | null;
  selectedSellerName?: string | null;
  onSelectSeller?: (id: string) => void;
  onSelectDate: (weekStartIso: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

export function RoutinesHeader({
  weekStart,
  seller,
  sellers,
  selectedSellerId,
  selectedSellerName,
  onSelectSeller,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
}: Props) {
  const weekNumber = getIsoWeekNumber(weekStart);
  const description = `Semana ${weekNumber} · ${formatWeekRange(weekStart)}`;
  const isCurrentWeek = weekStart === getCurrentWeekMondayIso();
  const canSelectSeller = Boolean(sellers);
  const sellerName = selectedSellerName ?? seller?.user?.name ?? null;

  const sellerOptions: SelectOption[] = (sellers ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const sellerValue =
    sellerOptions.find((o) => o.value === selectedSellerId) ?? null;

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Eyebrow>
            07 — Rotina{sellerName ? ` · ${sellerName}` : ""}
          </PanelHeader.Eyebrow>
          <PanelHeader.Title>Rotina da Semana</PanelHeader.Title>
          <PanelHeader.Description>{description}</PanelHeader.Description>
          <PanelHeader.Actions className="mt-6">
            {canSelectSeller && (
              <div className="w-[220px]">
                <Input.Select
                  options={sellerOptions}
                  value={sellerValue}
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
            <div className="w-[180px]">
              <Input.Date
                variant="single"
                value={isoToLocalDate(weekStart)}
                disabledClear
                placeholder="Escolher período"
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
              onClick={onPrevWeek}
            >
              <Button.Icon icon={ChevronLeft} />
            </Button.Root>
            <Button.Root
              appearance="tinted"
              color="amber"
              size="sm"
              noUppercase
              disabled={isCurrentWeek}
              onClick={onCurrentWeek}
            >
              <Button.Icon icon={CalendarDays} />
              <Button.Title>
                {isCurrentWeek ? "Semana atual" : "Voltar para atual"}
              </Button.Title>
            </Button.Root>
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              isIconOnly
              onClick={onNextWeek}
            >
              <Button.Icon icon={ChevronRight} />
            </Button.Root>
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
