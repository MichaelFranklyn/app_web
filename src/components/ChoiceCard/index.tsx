"use client";

import { ICON_SIZE } from "@/components/Icon";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface ChoiceCardOption<T extends string | number> {
  value: T;
  label: string;
  /** Linha de apoio: o que muda ao escolher (preço, prazo…). */
  hint?: string;
}

interface ChoiceCardGroupProps<T extends string | number> {
  options: ChoiceCardOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Layout da grade (colunas, gap); a peça só desenha os cartões. */
  className?: string;
  "aria-label"?: string;
}

/**
 * Escolha de uma entre poucas opções que precisam de uma linha de explicação
 * (ciclo de cobrança: "Anual — 2 meses grátis"). É o `ToggleGroup` com espaço
 * para o porquê: quando o rótulo sozinho não decide, a escolha vira cartão.
 * A escolhida fica em âmbar tingido com o marcador preenchido; `aria-pressed`
 * diz ao leitor de tela qual está valendo.
 */
export function ChoiceCardGroup<T extends string | number>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: ChoiceCardGroupProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("grid gap-12", className)}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            className={cn(
              "focus-ring flex cursor-pointer items-start gap-12 rounded-(--r-md) border p-16 text-left transition-colors",
              isSelected
                ? "border-(--amber) bg-(--amber-bg)"
                : "border-(--border) bg-(--bg2) hover:bg-(--bg3)"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-2 flex size-20 shrink-0 items-center justify-center rounded-full border",
                isSelected
                  ? "border-(--amber) bg-(--amber) text-(--color-on-action)"
                  : "border-(--border2)"
              )}
            >
              {isSelected && <Check size={ICON_SIZE.xs} />}
            </span>

            <span className="flex flex-col gap-4">
              <Title variant="heading-sm">{option.label}</Title>
              {option.hint && (
                <Title variant="body-sm" color="muted">
                  {option.hint}
                </Title>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
