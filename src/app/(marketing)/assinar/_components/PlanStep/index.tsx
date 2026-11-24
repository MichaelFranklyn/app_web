"use client";
import { Emphasis } from "@/components/Emphasis";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { ChoiceCardGroup, ChoiceCardOption } from "@/components/ChoiceCard";
import { ANNUAL_BILLED_MONTHS, MarketingPlan } from "../../../plans";
import { BillingCycle } from "../../interface";
import { formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { monthlyTotalFor } from "../../../pricing";
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
  users,
  cycle,
  onChangeCycle,
  onContinue,
}: {
  plan: MarketingPlan;
  users: number;
  cycle: BillingCycle;
  onChangeCycle: (cycle: BillingCycle) => void;
  onContinue: () => void;
}) {
  const monthly = monthlyTotalFor(plan, users) ?? 0;
  const annual = totalForCycle(plan, "annual", users) ?? 0;

  const options: ChoiceCardOption<BillingCycle>[] = [
    {
      value: "monthly",
      label: "Mensal",
      hint: `${formatMoney(monthly)} por mês`,
    },
    {
      value: "annual",
      label: "Anual",
      hint: `${formatMoney(annual)} por ano — ${
        12 - ANNUAL_BILLED_MONTHS
      } meses grátis`,
    },
  ];

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-8">
        <Title variant="heading-md">Como você prefere pagar</Title>

        <Title variant="body-sm" color="muted">
          Plano {plan.label} com {plural(users, "usuário", "usuários")}. O plano
          inclui {plan.limits}
        </Title>
      </div>

      <ChoiceCardGroup
        options={options}
        value={cycle}
        onChange={onChangeCycle}
        aria-label="Ciclo de cobrança"
        className="tablet:grid-cols-2"
      />

      <Title variant="body-sm" color="secondary">
        Total de hoje:{" "}
        <Emphasis>
          {formatMoney(totalForCycle(plan, cycle, users) ?? 0)}
        </Emphasis>
        . A renovação é automática e pode ser cancelada a qualquer momento.
      </Title>

      <div>
        <Button.Root color="amber" onClick={onContinue}>
          <Button.Title>Continuar</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
