"use client";

import { Input, InputNumber } from "@/components/Input";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";
import { ToggleGroup } from "@/components/ToggleGroup";

import {
  formatWeekRange,
  getWeekMondayIsoFromDate,
  isoToLocalDate,
} from "../../../utils";
import { WeekChoice } from "../../interface";
import { weekDates } from "../../utils";
import { DaysPicker } from "../DaysPicker";
import { useWeekSetup } from "./useWeekSetup";

const WEEK_OPTIONS: { value: WeekChoice; label: string }[] = [
  { value: "current", label: "Esta semana" },
  { value: "next", label: "Semana que vem" },
  { value: "other", label: "Outra semana" },
];

const toCount = (raw: string): number =>
  Math.max(0, Math.min(20, Number(raw) || 0));

interface Props {
  form: ReturnType<typeof useWeekSetup>;
}

/**
 * A configuração da semana: qual semana, que dias, quantas visitas e ligações
 * por dia, e se o sistema completa os dias com os mais urgentes. As
 * quantidades são o tamanho do dia que ele organiza — não um teto.
 */
export function WeekSetupForm({ form }: Props) {
  const openDates = weekDates(form.weekStart).filter(
    (iso) => iso >= form.todayIso
  );

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-8">
        <Title variant="label" color="secondary">
          Qual semana
        </Title>
        <ToggleGroup
          aria-label="Qual semana"
          options={WEEK_OPTIONS}
          value={form.weekChoice}
          onChange={form.setWeekChoice}
        />
        {form.weekChoice === "other" && (
          <div className="w-[200px]">
            <Input.Date
              size="sm"
              variant="single"
              disabledClear
              placeholder="Escolha um dia da semana"
              value={isoToLocalDate(form.otherWeekStart)}
              onChange={(date: unknown) => {
                if (date instanceof Date) {
                  form.setOtherWeekStart(getWeekMondayIsoFromDate(date));
                }
              }}
            />
          </div>
        )}
        <Title variant="body-xs" color="muted">
          {formatWeekRange(form.weekStart)}
        </Title>
      </div>

      <div className="flex flex-wrap gap-16">
        <InputNumber
          label="Visitas por dia"
          placeholder="Ex: 4"
          min={0}
          max={20}
          value={form.visitsPerDay}
          onChange={(e) => form.setVisitsPerDay(toCount(e.target.value))}
          containerClassName="w-[140px]"
        />
        <InputNumber
          label="Ligações por dia"
          placeholder="Ex: 2"
          min={0}
          max={20}
          value={form.callsPerDay}
          onChange={(e) => form.setCallsPerDay(toCount(e.target.value))}
          containerClassName="w-[140px]"
        />
      </div>

      {openDates.length === 0 ? (
        <Title variant="body-sm" color="muted">
          Essa semana já passou. Escolha outra.
        </Title>
      ) : (
        <DaysPicker
          openDates={openDates}
          days={form.days}
          onToggle={form.toggleDay}
        />
      )}

      <div className="flex flex-col gap-4">
        <InputCheckbox
          label="Completar os dias com os clientes mais urgentes"
          checked={form.fillWithSuggestions}
          onChange={(e) => form.setFill(e.target.checked)}
        />
        <Title variant="body-xs" color="muted">
          {form.hasSelection
            ? "Os clientes que você escolheu entram primeiro; o que faltar para chegar nas visitas e ligações por dia é completado pela lista."
            : "Você não escolheu ninguém: o sistema monta a semana com os clientes mais urgentes, e você confere antes de confirmar."}
        </Title>
      </div>
    </div>
  );
}
