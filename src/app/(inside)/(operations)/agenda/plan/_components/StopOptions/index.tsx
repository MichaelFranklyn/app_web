"use client";

import { Input, SelectOption } from "@/components/Input";
import { ToggleGroup } from "@/components/ToggleGroup";
import { CONTACT_TYPE_LABEL, VisitContactType } from "@/utils/visit";
import { Car, Phone } from "lucide-react";

import { StopChoice } from "../../interface";

const ANY_DAY = "__any__";

const CONTACT_OPTIONS = [
  {
    value: "IN_PERSON" as const,
    label: CONTACT_TYPE_LABEL.IN_PERSON,
    icon: Car,
  },
  { value: "REMOTE" as const, label: CONTACT_TYPE_LABEL.REMOTE, icon: Phone },
];

/** Dia da semana (ISO 1 = segunda). A data sai da semana configurada depois. */
const DAY_OPTIONS: SelectOption[] = [
  { value: ANY_DAY, label: "O sistema escolhe pela região" },
  { value: "1", label: "Segunda" },
  { value: "2", label: "Terça" },
  { value: "3", label: "Quarta" },
  { value: "4", label: "Quinta" },
  { value: "5", label: "Sexta" },
  { value: "6", label: "Sábado" },
];

interface Props {
  clientName: string;
  choice: StopChoice;
  onContactTypeChange: (contactType: VisitContactType) => void;
  onWeekdayChange: (weekday: number | null) => void;
}

/**
 * Como e quando, para um cliente escolhido. O dia é opcional e é um dia da
 * SEMANA ("quarta"): a semana em si se escolhe na configuração. Sem dia, o
 * sistema põe o cliente no dia em que já vai estar perto dele.
 */
export function StopOptions({
  clientName,
  choice,
  onContactTypeChange,
  onWeekdayChange,
}: Props) {
  const value =
    DAY_OPTIONS.find(
      (o) => o.value === (choice.weekday ? String(choice.weekday) : ANY_DAY)
    ) ?? null;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <ToggleGroup
        aria-label={`Como falar com ${clientName}`}
        options={CONTACT_OPTIONS}
        value={choice.contactType}
        onChange={onContactTypeChange}
      />
      <div className="desktop:w-[240px] desktop:flex-none min-w-[180px] flex-1">
        <Input.Select
          size="sm"
          variant="single"
          disabledClear
          aria-label={`Dia de ${clientName}`}
          placeholder="Escolha o dia"
          options={DAY_OPTIONS}
          value={value}
          onChange={(val: SelectOption | SelectOption[] | null) => {
            const opt = Array.isArray(val) ? val[0] : val;
            onWeekdayChange(
              !opt || opt.value === ANY_DAY ? null : Number(opt.value)
            );
          }}
        />
      </div>
    </div>
  );
}
