"use client";

import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
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
  const currentGuess = stockGuessLabel(product);

  return (
    <div className="flex flex-col gap-8 rounded-(--r-md) border border-(--border) bg-(--bg3) px-12 py-10">
      <div className="flex items-baseline justify-between gap-8">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-(--text)">
            {product.name}
          </div>
          <div className="text-[13px] text-(--muted)">{product.sku}</div>
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

      <div className="flex flex-wrap gap-4">
        {SHORTCUTS.map((shortcut) => {
          const active = days === shortcut.days;
          return (
            <button
              key={shortcut.days}
              type="button"
              onClick={() => {
                setShowCustom(false);
                onChange(product.id, shortcut.days);
              }}
              className={cn(
                "rounded-(--r-sm) border px-8 py-4 text-[13px] transition-colors",
                active
                  ? "border-(--amber) bg-(--amber) text-black"
                  : "border-(--border) text-(--muted) hover:border-(--border2)"
              )}
            >
              {shortcut.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className={cn(
            "rounded-(--r-sm) border px-8 py-4 text-[13px] transition-colors",
            showCustom
              ? "border-(--amber) text-(--amber)"
              : "border-(--border) text-(--muted) hover:border-(--border2)"
          )}
        >
          Outro
        </button>

        {showCustom && (
          <input
            type="number"
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
            className="w-[80px] rounded-(--r-sm) border border-(--border) bg-(--bg2) px-8 py-4 text-[13px] text-(--text)"
          />
        )}
      </div>
    </div>
  );
}
