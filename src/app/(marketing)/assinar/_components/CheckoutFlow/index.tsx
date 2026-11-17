"use client";

import { TextLink } from "@/components/TextLink";
import { Title } from "@/components/Title";
import { useSearchParams } from "next/navigation";
import { parseUsers } from "../../../pricing";
import { MarketingPlan } from "../../../plans";
import { findPlanByCode, totalForCycle } from "../../utils";
import { EnterpriseNotice } from "../EnterpriseNotice";
import { OrderSummary } from "../OrderSummary";
import { PaymentStep } from "../PaymentStep";
import { PlanPicker } from "../PlanPicker";
import { PlanStep } from "../PlanStep";
import { SignInNotice } from "../SignInNotice";
import { StepTrail } from "../StepTrail";
import { useCheckout } from "./useCheckout";

/**
 * Container do checkout: resolve o plano da URL e decide o que mostrar.
 *
 * Lê `?plano=` e `?usuarios=` com `useSearchParams`, o que exige `Suspense` no
 * pai: sem ele o Next recusa a rota estática.
 */
export function CheckoutFlow() {
  const searchParams = useSearchParams();
  const plan = findPlanByCode(searchParams.get("plano"));

  // Sem plano na URL (ou com código que não existe), a decisão ainda não foi
  // tomada: mostrar um checkout vazio seria cobrar o quê.
  if (!plan) return <PlanPicker />;

  // O Enterprise não tem preço de tabela — o valor é combinado em conversa.
  if (plan.demoMonthlyPrice === null) return <EnterpriseNotice plan={plan} />;

  // `?usuarios=` vem da calculadora da vitrine. Sem ele, vale o que o plano
  // inclui — o checkout nunca cobra abaixo da mensalidade cheia.
  const users = parseUsers(searchParams.get("usuarios"), plan);

  return <Checkout plan={plan} users={users} />;
}

/** Separado para o hook rodar só quando há plano vendável — hook não pode
 * ficar depois dos `return` antecipados acima. */
function Checkout({ plan, users }: { plan: MarketingPlan; users: number }) {
  const checkout = useCheckout(plan.code, users);

  return (
    <div className="desktop:grid-cols-[1.4fr_1fr] desktop:items-start grid gap-32">
      <div className="flex flex-col gap-24">
        <StepTrail current={checkout.step} />

        {checkout.step === "plan" && (
          <PlanStep
            plan={plan}
            users={users}
            cycle={checkout.cycle}
            onChangeCycle={checkout.setCycle}
            onContinue={checkout.goToPayment}
          />
        )}

        {checkout.step === "payment" && checkout.needsLogin && (
          <SignInNotice onBack={checkout.backToPlan} />
        )}

        {checkout.step === "payment" && !checkout.needsLogin && (
          <PaymentStep
            total={totalForCycle(plan, checkout.cycle, users) ?? 0}
            isAnnual={checkout.cycle === "annual"}
            error={checkout.error}
            isSubmitting={checkout.isSubmitting}
            onBack={checkout.backToPlan}
            onConfirm={checkout.confirm}
          />
        )}

        <Title variant="body-xs" color="muted">
          Ao assinar você concorda com os{" "}
          <TextLink href="/termos" tone="inherit" underline="always">
            Termos de uso
          </TextLink>{" "}
          e a{" "}
          <TextLink href="/privacidade" tone="inherit" underline="always">
            Política de privacidade
          </TextLink>
          . A renovação é automática e pode ser cancelada a qualquer momento.
        </Title>
      </div>

      <OrderSummary plan={plan} users={users} cycle={checkout.cycle} />
    </div>
  );
}
