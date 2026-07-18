"use client";

import { Plus, Trash2 } from "lucide-react";
import { ChangeEvent } from "react";

import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";

import { TierColumn } from "./interface";
import { findStaleListColumns } from "./wizardGuess";

interface Props {
  headers: string[];
  tiers: TierColumn[];
  onChange: (tiers: TierColumn[]) => void;
}

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Math.random());

export function TierMapper({ headers, tiers, onChange }: Props) {
  const columnOptions: SelectOption[] = headers.map((header, index) => ({
    value: String(index),
    label: header || `Coluna ${index + 1}`,
  }));

  // Colunas de uma lista anterior (ex.: "LISTA 38" ao lado de "LISTA 39"):
  // escolhê-las como nível importa preços desatualizados. Avisamos inline.
  const staleByIndex = new Map(
    findStaleListColumns(headers).map((stale) => [stale.index, stale])
  );

  const update = (id: string, patch: Partial<TierColumn>) =>
    onChange(tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const remove = (id: string) => onChange(tiers.filter((t) => t.id !== id));

  const add = () =>
    onChange([...tiers, { id: newId(), columnIndex: null, tierName: "" }]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-8">
        <span className="inline-flex items-center gap-4">
          <Title variant="caption" color="muted">
            Coluna de preço
          </Title>
          <HelpTooltip
            label="Como funcionam as colunas de preço?"
            content="Escolha as colunas da planilha que contêm preços. Ignore colunas de listas antigas ou de variação (%). A semântica do valor (por embalagem ou por unidade) é definida logo abaixo."
            position="right"
          />
        </span>
        <span className="inline-flex items-center gap-4">
          <Title variant="caption" color="muted">
            Nível comercial
          </Title>
          <HelpTooltip
            label="O que é nível comercial?"
            content="Faixa de preço praticada pela fábrica (ex.: DIAMANTE, PLATINA, OURO). Cada coluna de preço vira um nível; níveis que não existirem são criados."
            position="right"
          />
        </span>
        <span className="w-32" />
      </div>

      {tiers.map((tier) => {
        const stale =
          tier.columnIndex !== null
            ? staleByIndex.get(tier.columnIndex)
            : undefined;
        return (
          <div key={tier.id} className="flex flex-col gap-4">
            <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-8">
              <Input.Select
                options={columnOptions}
                value={
                  columnOptions.find(
                    (o) => o.value === String(tier.columnIndex)
                  ) ?? null
                }
                variant="single"
                placeholder="Selecione a coluna"
                onChange={(val: SelectOption | SelectOption[] | null) => {
                  const opt = Array.isArray(val) ? val[0] : val;
                  const columnIndex = opt ? Number(opt.value) : null;
                  // Sugere o nome do nível a partir do cabeçalho, se ainda vazio.
                  const suggested =
                    !tier.tierName && columnIndex !== null
                      ? (headers[columnIndex] ?? "")
                      : tier.tierName;
                  update(tier.id, { columnIndex, tierName: suggested });
                }}
              />
              <Input.Text
                value={tier.tierName}
                placeholder="Ex: DIAMANTE"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update(tier.id, { tierName: e.target.value })
                }
              />
              <Button.Root
                type="button"
                appearance="ghost"
                color="red"
                size="sm"
                onClick={() => remove(tier.id)}
              >
                <Button.Icon icon={Trash2} />
              </Button.Root>
            </div>
            {stale && (
              <Title variant="caption" color="orange">
                ⚠ Esta parece ser a LISTA {stale.listNumber} (anterior). A mais
                recente é a LISTA {stale.latestNumber} — confira se é a coluna
                que você quer importar.
              </Title>
            )}
          </div>
        );
      })}

      <div>
        <Button.Root
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          onClick={add}
        >
          <Button.Icon icon={Plus} />
          <Button.Title>Adicionar nível</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
