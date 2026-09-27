"use client";

import { Input, SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";

import { MatchOption } from "../../interface";

interface Props {
  /** O nome como está na planilha. */
  value: string;
  options: MatchOption[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  placeholder: string;
}

/** "Na planilha: HERC PLASTICOS" → qual cadastro daqui é esse. */
export function ValueMatchRow({
  value,
  options,
  selectedId,
  onChange,
  placeholder,
}: Props) {
  const selectOptions: SelectOption[] = options.map((o) => ({
    value: o.id,
    label: o.label,
  }));
  return (
    <div className="tablet:grid-cols-[1fr_1fr] tablet:gap-12 grid grid-cols-1 items-center gap-6">
      <Title variant="body-sm" weight="medium" className="min-w-0 truncate">
        {value}
      </Title>
      <Input.Select
        placeholder={placeholder}
        options={selectOptions}
        value={selectOptions.find((o) => o.value === selectedId) ?? null}
        variant="single"
        onChange={(val: SelectOption | SelectOption[] | null) => {
          const opt = Array.isArray(val) ? val[0] : val;
          onChange(opt ? String(opt.value) : null);
        }}
      />
    </div>
  );
}
