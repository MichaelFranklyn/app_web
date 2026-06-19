"use client";

import { ArrowRight } from "lucide-react";

import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Title } from "@/components/Title";

interface Props {
  title: string;
  values: string[];
  existingLabels: string[];
  recon: Record<string, string>;
  onChange: (value: string, final: string) => void;
}

const NEW_PREFIX = "novo:";

/** Concilia valores distintos da planilha com o catálogo existente (reusar ou criar). */
export function Reconciliation({ title, values, existingLabels, recon, onChange }: Props) {
  if (values.length === 0) return null;

  const existingSet = new Set(existingLabels.map((l) => l.toLowerCase()));

  return (
    <div className="flex flex-col gap-8">
      <Title variant="caption" weight="medium">
        {title}
      </Title>
      {values.map((value) => {
        const isNew = !existingSet.has(value.toLowerCase());
        const options: SelectOption[] = [
          ...(isNew ? [{ value: `${NEW_PREFIX}${value}`, label: `Criar novo: "${value}"` }] : []),
          ...existingLabels.map((label) => ({ value: label, label })),
        ];

        const final = recon[value] ?? value;
        const currentValue = isNew && final === value ? `${NEW_PREFIX}${value}` : final;
        const selected = options.find((o) => o.value === currentValue) ?? null;

        return (
          <div key={value} className="grid grid-cols-[1fr_auto_1fr] items-center gap-8">
            <Title variant="body-sm" color="muted" className="truncate" title={value}>
              {value}
            </Title>
            <ArrowRight className="size-14 text-(--muted)" />
            <Input.Select
              options={options}
              value={selected}
              variant="single"
              disabledClear
              onChange={(val: SelectOption | SelectOption[] | null) => {
                const opt = Array.isArray(val) ? val[0] : val;
                if (!opt) return;
                const raw = String(opt.value);
                onChange(value, raw.startsWith(NEW_PREFIX) ? raw.slice(NEW_PREFIX.length) : raw);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
