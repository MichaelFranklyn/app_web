"use client";

import { ChangeEvent, ReactNode } from "react";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Title } from "@/components/Title";

import { ColumnChoice } from "./columns";

const FIXED = "fixed";

interface Props {
  label: string;
  headers: string[];
  choice: ColumnChoice;
  onChange: (choice: ColumnChoice) => void;
  /** Conteúdo do tooltip de ajuda ao lado do label. */
  help?: ReactNode;
  /** Exemplo exibido como placeholder do valor fixo (ex.: "Peça"). */
  fixedExample?: string;
}

/** Linha de mapeamento genérica: um campo → coluna da planilha ou valor fixo. */
export function FieldMapper({
  label,
  headers,
  choice,
  onChange,
  help,
  fixedExample,
}: Props) {
  const options: SelectOption[] = [
    ...headers.map((header, index) => ({
      value: `col:${index}`,
      label: header || `Coluna ${index + 1}`,
    })),
    { value: FIXED, label: "Usar valor fixo…" },
  ];

  const selected: SelectOption | null =
    choice.kind === "column"
      ? options[choice.index] ?? null
      : choice.kind === "fixed"
        ? { value: FIXED, label: "Usar valor fixo…" }
        : null;

  const handleSelect = (val: SelectOption | SelectOption[] | null) => {
    const opt = Array.isArray(val) ? val[0] : val;
    if (!opt) return onChange({ kind: "none" });
    if (opt.value === FIXED) {
      onChange({ kind: "fixed", value: choice.kind === "fixed" ? choice.value : "" });
      return;
    }
    onChange({ kind: "column", index: Number(opt.value.replace("col:", "")) });
  };

  return (
    <div className="grid grid-cols-[190px_1fr] items-start gap-8">
      <div className="inline-flex min-h-32 items-center gap-4 whitespace-nowrap">
        <Title variant="body-sm" weight="medium">
          {label}
        </Title>
        {help && <HelpTooltip label={`O que é ${label}?`} content={help} position="right" />}
      </div>
      <div className="flex flex-col gap-6">
        <Input.Select
          options={options}
          value={selected}
          onChange={handleSelect}
          variant="single"
          placeholder="Selecione a coluna"
        />
        {choice.kind === "fixed" && (
          <div className="flex flex-col gap-4 rounded-md border border-(--border) bg-(--bg2) p-8">
            <Input.Text
              label="Valor fixo"
              value={choice.value}
              placeholder={fixedExample ? `Ex: ${fixedExample}` : `Valor para ${label.toLowerCase()}`}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange({ kind: "fixed", value: e.target.value })
              }
            />
            <Title variant="caption" color="muted">
              {choice.value.trim()
                ? `Todas as linhas da planilha usarão "${choice.value.trim()}" como ${label.toLowerCase()}.`
                : "O mesmo valor será aplicado a todas as linhas da planilha."}
            </Title>
          </div>
        )}
      </div>
    </div>
  );
}
