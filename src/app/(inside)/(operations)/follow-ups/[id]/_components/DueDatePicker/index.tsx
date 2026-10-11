"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { getBrtTodayIso, parseLocalDate, toIsoDate } from "@/utils/format/date";

import { isSchedulable, quickDates, weekdayName } from "../../utils";

interface Props {
  label: string;
  value: string;
  onChange: (iso: string) => void;
}

/**
 * O dia do contato: atalhos (amanhã, 1 semana…) e o calendário para o resto.
 *
 * O calendário não trava o passado, então o aviso fica aqui — e o botão de
 * salvar, no modal, também não deixa passar.
 */
export function DueDatePicker({ label, value, onChange }: Props) {
  const today = getBrtTodayIso();
  const isPast = Boolean(value) && !isSchedulable(value, today);

  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium">
        {label}
      </Title>
      <div className="flex flex-wrap gap-4">
        {quickDates(today).map((quick) => (
          <Button.Root
            key={quick.label}
            type="button"
            appearance={value === quick.value ? "tinted" : "outline"}
            color={value === quick.value ? "amber" : "neutral"}
            size="sm"
            noUppercase
            aria-pressed={value === quick.value}
            onClick={() => onChange(quick.value)}
          >
            <Button.Title>{quick.label}</Button.Title>
          </Button.Root>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-10">
        <Input.Date
          variant="single"
          placeholder="Ou escolha no calendário"
          value={parseLocalDate(value)}
          onChange={(date: unknown) => onChange(date ? toIsoDate(date) : "")}
          containerClassName="w-[220px]"
        />
        {isPast && (
          <Title variant="micro" color="red">
            Este dia já passou — escolha hoje ou uma data à frente.
          </Title>
        )}
        {value && !isPast && (
          <Title variant="micro" color="muted">
            {weekdayName(value)}
          </Title>
        )}
      </div>
    </div>
  );
}
