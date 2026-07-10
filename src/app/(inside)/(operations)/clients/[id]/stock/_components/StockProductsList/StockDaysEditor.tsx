"use client";

import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useState } from "react";

// O vendedor liga e o cliente responde em dias, não em rótulos. Os atalhos cobrem
// as respostas típicas; o campo livre cobre o resto. Mesmo vocabulário da visita.
const SHORTCUTS: { label: string; days: number }[] = [
  { label: "Já acabou", days: 0 },
  { label: "1 semana", days: 7 },
  { label: "15 dias", days: 15 },
  { label: "1 mês", days: 30 },
  { label: "45 dias", days: 45 },
];

const isShortcut = (days: number | null): boolean =>
  days != null && SHORTCUTS.some((s) => s.days === days);

interface Props {
  productName: string;
  initialDays: number | null;
  isLoading: boolean;
  onSave: (days: number) => void;
  onCancel: () => void;
}

/** Editor inline de dias de estoque de um produto, fora de uma visita. */
export function StockDaysEditor({
  productName,
  initialDays,
  isLoading,
  onSave,
  onCancel,
}: Props) {
  const [days, setDays] = useState<number | null>(initialDays);
  const [showCustom, setShowCustom] = useState(
    initialDays != null && !isShortcut(initialDays)
  );

  return (
    <div className="flex flex-col gap-8 rounded-(--r-md) border border-(--border) bg-(--bg3) px-12 py-10">
      <div className="text-[13px] text-(--muted)">
        Quantos dias o estoque de{" "}
        <span className="font-medium text-(--text)">{productName}</span> ainda
        dura, segundo o cliente?
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {SHORTCUTS.map((shortcut) => {
          const active = days === shortcut.days;
          return (
            <button
              key={shortcut.days}
              type="button"
              onClick={() => {
                setShowCustom(false);
                setDays(shortcut.days);
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
            aria-label={`Dias de estoque de ${productName}`}
            value={days ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              setDays(raw === "" ? null : Number(raw));
            }}
            placeholder="dias"
            className="w-[80px] rounded-(--r-sm) border border-(--border) bg-(--bg2) px-8 py-4 text-[13px] text-(--text)"
          />
        )}

        <div className="ml-auto flex items-center gap-4">
          <Button.Root
            type="button"
            appearance="ghost"
            color="neutral"
            size="sm"
            noUppercase
            disabled={isLoading}
            onClick={onCancel}
          >
            <Button.Icon icon={X} />
            <Button.Title>Cancelar</Button.Title>
          </Button.Root>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="sm"
            noUppercase
            loading={isLoading}
            disabled={days == null}
            onClick={() => days != null && onSave(days)}
          >
            <Button.Icon icon={Check} />
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </div>
      </div>
    </div>
  );
}
