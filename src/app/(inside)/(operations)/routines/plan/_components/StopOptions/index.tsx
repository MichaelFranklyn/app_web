"use client";

import { Input, SelectOption } from "@/components/Input";
import { ToggleGroup } from "@/components/ToggleGroup";
import { CONTACT_TYPE_LABEL, VisitContactType } from "@/utils/visit";
import { Car, Phone } from "lucide-react";

import { StopChoice } from "../../interface";
import { dayChipLabel } from "../../utils";

const ANY_DAY = "__any__";

const CONTACT_OPTIONS = [
  {
    value: "IN_PERSON" as const,
    label: CONTACT_TYPE_LABEL.IN_PERSON,
    icon: Car,
  },
  { value: "REMOTE" as const, label: CONTACT_TYPE_LABEL.REMOTE, icon: Phone },
];

interface Props {
  clientName: string;
  choice: StopChoice;
  openDates: string[];
  onContactTypeChange: (contactType: VisitContactType) => void;
  onDateChange: (date: string | null) => void;
}

/**
 * Como e quando, para um cliente escolhido. O dia é opcional: sem ele, o
 * sistema põe o cliente no dia em que já vai estar perto dele.
 */
export function StopOptions({
  clientName,
  choice,
  openDates,
  onContactTypeChange,
  onDateChange,
}: Props) {
  const dayOptions: SelectOption[] = [
    { value: ANY_DAY, label: "O sistema escolhe pela região" },
    ...openDates.map((iso) => ({ value: iso, label: dayChipLabel(iso) })),
  ];
  const value =
    dayOptions.find((o) => o.value === (choice.date ?? ANY_DAY)) ?? null;

  return (
    <div className="flex flex-wrap items-center gap-8">
      <ToggleGroup
        aria-label={`Como falar com ${clientName}`}
        options={CONTACT_OPTIONS}
        value={choice.contactType}
        onChange={onContactTypeChange}
      />
      <div className="desktop:w-[240px] w-full">
        <Input.Select
          size="sm"
          variant="single"
          disabledClear
          aria-label={`Dia de ${clientName}`}
          placeholder="Escolha o dia"
          options={dayOptions}
          value={value}
          onChange={(val: SelectOption | SelectOption[] | null) => {
            const opt = Array.isArray(val) ? val[0] : val;
            onDateChange(!opt || opt.value === ANY_DAY ? null : opt.value);
          }}
        />
      </div>
    </div>
  );
}
