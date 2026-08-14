"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ANNUAL_BILLED_MONTHS, MarketingPlan } from "../../../plans";
import { BillingCycle } from "../../interface";
import { formatMoney } from "@/utils/format/masks";
import { totalForCycle } from "../../utils";

/**
 * Primeiro passo: confirmar o plano que veio da URL e escolher o ciclo.
 *
 * O ciclo vem antes dos dados porque muda o valor — pedir cartão e só depois
 * revelar que existia um desconto anual é o jeito mais rápido de fazer alguém
 * abandonar o carrinho.
 */
export function PlanStep({
  plan,
  cycle,
  onChangeCycle,
  onContinue,
}: {
  plan: MarketingPlan;
  cycle: BillingCycle;
  onChangeCycle: (cycle: BillingCycle) => void;
  onContinue: () => void;
}) {
  const monthly = plan.demoMonthlyPrice ?? 0;

  const options: { key: BillingCycle; label: string; hint: string }[] = [
    {
      key: "monthly",
      label: "Mensal",
      hint: `${formatMoney(monthly)} por mês`,
    },
    {
      key: "annual",
      label: "Anual",
      hint: `${formatMoney(monthly * ANNUAL_BILLED_MONTHS)} por ano — ${
        12 - ANNUAL_BILLED_MONTHS
      } meses grátis`,
    },
  ];

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-8">
        <Title variant="heading-md">Como você prefere pagar</Title>

        <Title variant="body-sm" color="muted">
          Plano {plan.label}. {plan.limits}
        </Title>
      </div>

      <div className="tablet:grid-cols-2 grid gap-12">
        {options.map((option) => {
          const isSelected = option.key === cycle;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChangeCycle(option.key)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-start gap-12 rounded-(--radius-md) border p-16 text-left transition",
                isSelected
                  ? "border-(--amber) bg-(--amber-bg)"
                  : "border-(--border) bg-(--bg2) hover:bg-(--bg3)"
              )}
            >
              <span
                className={cn(
                  "mt-2 flex size-20 shrink-0 items-center justify-center rounded-(--radius-full) border",
                  isSelected
                    ? "border-(--amber) bg-(--amber) text-(--bg2)"
                    : "border-(--border2)"
                )}
              >
                {isSelected && <Check size={12} />}
              </span>

              <span className="flex flex-col gap-4">
                <Title variant="heading-sm">{option.label}</Title>
                <Title variant="body-sm" color="muted">
                  {option.hint}
                </Title>
              </span>
            </button>
          );
        })}
      </div>

      <Title variant="body-sm" color="secondary">
        Total de hoje:{" "}
        <strong>{formatMoney(totalForCycle(plan, cycle) ?? 0)}</strong>. A
        renovação é automática e pode ser cancelada a qualquer momento.
      </Title>

      <div>
        <Button.Root color="amber" onClick={onContinue}>
          <Button.Title>Continuar</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
