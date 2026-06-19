"use client";

import { Plus, Trash2 } from "lucide-react";
import { ChangeEvent } from "react";

import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Title } from "@/components/Title";

import { TaxColumn } from "./interface";

interface Props {
  headers: string[];
  taxes: TaxColumn[];
  onChange: (taxes: TaxColumn[]) => void;
}

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random());

export function TaxMapper({ headers, taxes, onChange }: Props) {
  const columnOptions: SelectOption[] = headers.map((header, index) => ({
    value: String(index),
    label: header || `Coluna ${index + 1}`,
  }));

  const update = (id: string, patch: Partial<TaxColumn>) =>
    onChange(taxes.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const remove = (id: string) => onChange(taxes.filter((t) => t.id !== id));

  const add = () => onChange([...taxes, { id: newId(), columnIndex: null, taxName: "" }]);

  return (
    <div className="flex flex-col gap-8">
      {taxes.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-8">
          <span className="inline-flex items-center gap-4">
            <Title variant="caption" color="muted">Coluna da alíquota</Title>
            <HelpTooltip
              label="Como funcionam as colunas de imposto?"
              content="Cada coluna escolhida vira um imposto do produto, somado por cima do preço. Para ST por MVA use o bloco específico abaixo — aqui entram só alíquotas simples."
              position="right"
            />
          </span>
          <Title variant="caption" color="muted">Nome do imposto</Title>
          <span className="w-32" />
        </div>
      )}

      {taxes.map((tax) => (
        <div key={tax.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-8">
          <Input.Select
            options={columnOptions}
            value={columnOptions.find((o) => o.value === String(tax.columnIndex)) ?? null}
            variant="single"
            placeholder="Selecione a coluna"
            onChange={(val: SelectOption | SelectOption[] | null) => {
              const opt = Array.isArray(val) ? val[0] : val;
              const columnIndex = opt ? Number(opt.value) : null;
              // Sugere o nome do imposto a partir do cabeçalho, se ainda vazio.
              const suggested =
                !tax.taxName && columnIndex !== null ? headers[columnIndex] ?? "" : tax.taxName;
              update(tax.id, { columnIndex, taxName: suggested });
            }}
          />
          <Input.Text
            value={tax.taxName}
            placeholder="Ex: ICMS"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              update(tax.id, { taxName: e.target.value })
            }
          />
          <Button.Root
            type="button"
            appearance="ghost"
            color="red"
            size="sm"
            onClick={() => remove(tax.id)}
          >
            <Button.Icon icon={Trash2} />
          </Button.Root>
        </div>
      ))}

      <div>
        <Button.Root type="button" appearance="outline" color="neutral" size="sm" noUppercase onClick={add}>
          <Button.Icon icon={Plus} />
          <Button.Title>Adicionar imposto</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
