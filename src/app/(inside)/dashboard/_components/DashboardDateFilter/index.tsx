"use client";

import { InputDate } from "@/components/Input";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangeIso } from "../../interface";
import { toUtcIsoDate } from "@/utils/format/date";
import { isoToLocalDate } from "../../utils";

interface Props {
  value: DateRangeIso;
  onChange: (range: DateRangeIso) => void;
}

const localDateToIso = (date: Date) =>
  toUtcIsoDate(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  );

export function DashboardDateFilter({ value, onChange }: Props) {
  const [draft, setDraft] = useState<DateRangeIso>(value);

  useEffect(() => {
    setDraft(value);
    // Sincroniza só quando os valores mudam, não a cada nova identidade do objeto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.from, value.to]);

  const pickerValue = useMemo<DateRange>(
    () => ({ from: isoToLocalDate(draft.from), to: isoToLocalDate(draft.to) }),
    [draft.from, draft.to]
  );

  const handleChange = (next: Date | DateRange | undefined | null) => {
    if (!next || next instanceof Date) return;
    if (!next.from || !next.to) return;
    setDraft({ from: localDateToIso(next.from), to: localDateToIso(next.to) });
  };

  const handleClose = () => {
    if (draft.from === value.from && draft.to === value.to) return;
    onChange(draft);
  };

  return (
    <div className="w-[260px]">
      <InputDate
        variant="range"
        value={pickerValue}
        onChange={handleChange}
        onClose={handleClose}
        disabledClear
        placeholder="Selecione o período"
      />
    </div>
  );
}
