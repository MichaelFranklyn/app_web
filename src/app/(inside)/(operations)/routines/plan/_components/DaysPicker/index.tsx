"use client";

import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";

import { dayChipLabel } from "../../utils";

interface Props {
  openDates: string[];
  days: string[];
  onToggle: (iso: string) => void;
}

/**
 * Em que dias o sistema pode pôr quem veio sem dia escolhido. O último dia
 * marcado não desmarca: sem nenhum, não haveria onde pôr ninguém.
 */
export function DaysPicker({ openDates, days, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <Title variant="label" color="secondary">
        Dias em que você vai trabalhar
      </Title>
      <div className="flex flex-wrap gap-12">
        {openDates.map((iso) => {
          const checked = days.includes(iso);
          return (
            <InputCheckbox
              key={iso}
              label={dayChipLabel(iso)}
              checked={checked}
              disabled={checked && days.length === 1}
              onChange={() => onToggle(iso)}
            />
          );
        })}
      </div>
    </div>
  );
}
