"use client";

import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { getTodayIso, parseLocalDate, toIsoDate } from "@/utils/format/date";
import { formatDayLabel, formatWeekdayLabel } from "../../utils";

interface Props {
  /** Dia em que o contato está hoje — o padrão da viagem. */
  currentDate: string | null;
  /** Data escolhida (ISO) ou "" para manter o dia atual. */
  value: string;
  onChange: (isoDate: string) => void;
  disabled?: boolean;
}

/**
 * Em que dia fazer a viagem.
 *
 * Uma viagem longa quase sempre pede um dia mais vazio, e trocar o dia aqui
 * refaz a conta inteira: o aviso de "toma o dia" some quando o destino não tem
 * nada marcado. Vazio mantém o dia em que o contato já está.
 */
export function TripDayPicker({
  currentDate,
  value,
  onChange,
  disabled,
}: Props) {
  const effective = value || currentDate || "";
  // O componente de calendário não trava datas anteriores, então o aviso (e a
  // trava do botão, no hook) fica aqui — o backend recusaria de todo jeito.
  const isPast = !!effective && effective < getTodayIso();

  return (
    <div className="flex flex-col gap-6">
      <Title variant="body-sm" weight="medium">
        Dia da viagem
      </Title>
      <div className="flex flex-wrap items-center gap-10">
        <Input.Date
          variant="single"
          value={parseLocalDate(effective)}
          disabled={disabled}
          // O campo do FormBuilder devolve Date; aqui a conversão é explícita
          // porque a data viaja como ISO até o backend.
          onChange={(date: unknown) => onChange(toIsoDate(date))}
          containerClassName="w-[190px]"
        />
        {isPast && (
          <Title variant="micro" color="red">
            Este dia já passou — escolha outro.
          </Title>
        )}
        {effective && !isPast && (
          <Title variant="micro" color="muted">
            {formatWeekdayLabel(effective)} · {formatDayLabel(effective)}
            {value && currentDate && value !== currentDate
              ? " (mudou de dia)"
              : ""}
          </Title>
        )}
      </div>
    </div>
  );
}
