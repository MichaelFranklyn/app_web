"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { InputNumber } from "@/components/Input";
import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";
import { useState } from "react";

import { stockGuessLabel } from "./stockGuess";
import { StockCandidateProduct } from "./useStockObservation";

// O vendedor pergunta "ainda tem?" e o cliente responde em dias, não em rótulos.
// Os atalhos cobrem as respostas típicas; o campo livre cobre o resto.
const SHORTCUTS: { label: string; days: number }[] = [
  { label: "Já acabou", days: 0 },
  { label: "1 semana", days: 7 },
  { label: "15 dias", days: 15 },
  { label: "1 mês", days: 30 },
  { label: "45 dias", days: 45 },
];

const isShortcut = (days: number | null | undefined): boolean =>
  days != null && SHORTCUTS.some((s) => s.days === days);

/** "Outro" abre o campo livre; não é um número de dias. */
const CUSTOM = "outro";

const OPTIONS: ToggleOption<number | typeof CUSTOM>[] = [
  ...SHORTCUTS.map((s) => ({ value: s.days, label: s.label })),
  { value: CUSTOM, label: "Outro" },
];

interface Props {
  product: StockCandidateProduct;
  days: number | null | undefined;
  onChange: (productId: string, days: number | null) => void;
}

export function ProductDaysRow({ product, days, onChange }: Props) {
  // Só abre o campo livre quando o valor não é um dos atalhos.
  const [showCustom, setShowCustom] = useState(
    days != null && !isShortcut(days)
  );

  const marked = days != null;
  const selected = showCustom
    ? CUSTOM
    : isShortcut(days)
      ? (days ?? null)
      : null;
  const currentGuess = stockGuessLabel(product);

  return (
    <Card.Root inset tone="muted">
      <Card.Body padding="sm">
        <div className="flex items-baseline justify-between gap-8">
          <div className="min-w-0">
            <Title variant="body-sm" weight="medium" className="truncate">
              {product.name}
            </Title>
            <Title variant="body-sm" color="muted">
              {product.sku}
            </Title>
          </div>
          {marked ? (
            <Title variant="micro" color="secondary" className="shrink-0">
              {days === 0 ? "sem estoque" : `dura ~${days} dias`}
            </Title>
          ) : (
            // Antes de responder, o vendedor vê o que o sistema ACHA — e a
            // procedência do palpite. Confirmar ou corrigir um número é muito
            // mais rápido que produzir um do zero, e é a diferença entre o
            // cliente responder e dar de ombros.
            currentGuess && (
              <Title variant="micro" color="muted2" className="shrink-0">
                {currentGuess}
              </Title>
            )
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ToggleGroup
            options={OPTIONS}
            value={selected}
            onChange={(value) => {
              if (value === CUSTOM) {
                setShowCustom((open) => !open);
                return;
              }
              setShowCustom(false);
              onChange(product.id, value);
            }}
            aria-label={`Quanto dura o estoque de ${product.name}`}
          />

          {showCustom && (
            <InputNumber
              size="sm"
              min={0}
              max={365}
              inputMode="numeric"
              aria-label={`Dias de estoque de ${product.name}`}
              value={days ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                onChange(product.id, raw === "" ? null : Number(raw));
              }}
              placeholder="dias"
              containerClassName="w-[96px]"
            />
          )}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
