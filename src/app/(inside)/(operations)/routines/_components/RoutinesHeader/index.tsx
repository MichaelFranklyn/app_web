"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { RoutineSellerOption } from "../../interface";
import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { ScheduleVisitButton } from "../ScheduleVisitButton";
import {
  formatWeekRange,
  getIsoWeekNumber,
  getWeekMondayIsoFromDate,
  isoToLocalDate,
} from "../../utils";

interface Props {
  weekStart: string;
  sellers?: RoutineSellerOption[];
  selectedSellerId?: string | null;
  /** Vendedor de fato em tela (o logado, quando não há seletor de vendedor). */
  effectiveSellerId?: string | null;
  /** Recarrega a semana depois de uma visita marcada à mão. */
  onVisitScheduled?: () => void;
  onSelectSeller?: (id: string) => void;
  onSelectDate: (weekStartIso: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

export function RoutinesHeader({
  weekStart,
  sellers,
  selectedSellerId,
  effectiveSellerId,
  onVisitScheduled,
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
          <PanelHeader.Title>Rotina da Semana</PanelHeader.Title>
          <PanelHeader.Description>{description}</PanelHeader.Description>
          <PanelHeader.Actions
            className="mt-6"
            data-tour="routines-header-actions"
          >
            {canSelectSeller && (
              <div className="desktop:w-[220px] w-full">
                <Input.Select
                  size="sm"
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
            <div className="desktop:w-[180px] w-full">
              <Input.Date
                size="sm"
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
            {/* Navegação de semana: anterior + atual + próxima sempre juntos
                (quebram em bloco, nunca separados em linhas diferentes). No
                mobile/tablet o bloco ocupa a largura toda e o botão central
                cresce; a partir de desktop volta ao tamanho natural. */}
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
              <Button.Root
                appearance="tinted"
                color="amber"
                size="sm"
                noUppercase
                disabled={isCurrentWeek}
                onClick={onCurrentWeek}
                className="desktop:flex-initial flex-1"
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
                label="Próxima semana"
                onClick={onNextWeek}
              >
                <Button.Icon icon={ChevronRight} />
              </Button.Root>
            </div>
            {/* Fica no cabeçalho, e não na barra de ações da grade, porque a
                semana SEM rotina é justamente quando mais se precisa dele. */}
            <ScheduleVisitButton
              sellerId={effectiveSellerId ?? selectedSellerId ?? null}
              onScheduled={() => onVisitScheduled?.()}
            />
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
