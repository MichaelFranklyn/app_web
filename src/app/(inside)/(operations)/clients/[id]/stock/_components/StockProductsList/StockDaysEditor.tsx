"use client";
import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
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

const CHOICES: ToggleOption<number | "custom">[] = [
  ...SHORTCUTS.map(({ label, days }) => ({ label, value: days })),
  { label: "Outro", value: "custom" },
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
    <Card.Root inset tone="muted">
      <Card.Body padding="sm" className="gap-8">
        <Title variant="body-sm" color="muted">
          Quantos dias o estoque de{" "}
          <Title variant="body-xs" weight="medium">
            {productName}
          </Title>{" "}
          ainda dura, segundo o cliente?
        </Title>

        <div className="flex flex-wrap items-center gap-4">
          <ToggleGroup<number | "custom">
            aria-label="Dias de estoque"
            options={CHOICES}
            value={showCustom ? "custom" : days}
            onChange={(choice) => {
              if (choice === "custom") {
                setShowCustom((v) => !v);
                return;
              }
              setShowCustom(false);
              setDays(choice);
            }}
          />

          {showCustom && (
            <Input.Number
              min={0}
              max={365}
              inputMode="numeric"
              size="sm"
              aria-label={`Dias de estoque de ${productName}`}
              value={days ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                setDays(raw === "" ? null : Number(raw));
              }}
              placeholder="dias"
              containerClassName="w-[80px]"
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
      </Card.Body>
    </Card.Root>
  );
}
