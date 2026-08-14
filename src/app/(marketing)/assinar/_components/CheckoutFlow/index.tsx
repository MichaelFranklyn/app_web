"use client";

import { Title } from "@/components/Title";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { findPlanByCode } from "../../utils";
import { BillingStep } from "../BillingStep";
import { DemoNotice } from "../DemoNotice";
import { EnterpriseNotice } from "../EnterpriseNotice";
import { OrderSummary } from "../OrderSummary";
import { PaymentStep } from "../PaymentStep";
import { PlanStep } from "../PlanStep";
import { PlanPicker } from "../PlanPicker";
import { ResultStep } from "../ResultStep";
import { StepTrail } from "../StepTrail";
import { useCheckout } from "./useCheckout";

/**
 * Container do checkout simulado: resolve o plano da URL e conduz os passos.
 *
 * Fino de propósito — o estado inteiro está em `useCheckout`, e cada passo é um
 * componente que só recebe valores e callbacks. Quando o gateway real entrar,
 * este arquivo não muda.
 *
 * Lê `?plano=` com `useSearchParams`, o que exige `Suspense` no pai: sem ele o
 * Next recusa a rota estática.
 */
export function CheckoutFlow() {
  const plan = findPlanByCode(useSearchParams().get("plano"));
  const checkout = useCheckout();

  // Sem plano na URL (ou com código que não existe), a decisão ainda não foi
  // tomada: mostrar um checkout vazio seria pedir cartão para comprar o quê.
  if (!plan) return <PlanPicker />;

  // O Enterprise não tem preço de tabela — mandar esse caso para o formulário
  // de cartão seria inventar um valor que ninguém combinou.
  if (plan.demoMonthlyPrice === null) return <EnterpriseNotice plan={plan} />;

  return (
    <div className="desktop:grid-cols-[1.4fr_1fr] desktop:items-start grid gap-32">
      <div className="flex flex-col gap-24">
        <DemoNotice />

        <StepTrail current={checkout.step} />

        {checkout.step === "plan" && (
          <PlanStep
            plan={plan}
            cycle={checkout.cycle}
            onChangeCycle={checkout.setCycle}
            onContinue={checkout.goToBilling}
          />
        )}

        {checkout.step === "billing" && (
          <BillingStep
            data={checkout.billing}
            errors={checkout.errors}
            onChange={checkout.setBilling}
            onBack={checkout.backToPlan}
            onContinue={checkout.submitBilling}
          />
        )}

        {checkout.step === "payment" && (
          <PaymentStep
            data={checkout.card}
            errors={checkout.errors}
            isProcessing={checkout.isProcessing}
            onChange={checkout.setCard}
            onBack={checkout.backToBilling}
            onSubmit={checkout.submitPayment}
          />
        )}

        {checkout.step === "result" && checkout.outcome && (
          <ResultStep
            outcome={checkout.outcome}
            plan={plan}
            onRetry={checkout.retryPayment}
          />
        )}

        <Title variant="body-xs" color="muted">
          Ao assinar você concorda com os{" "}
          <Link href="/termos" className="underline hover:opacity-70">
            Termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="underline hover:opacity-70">
            Política de privacidade
          </Link>
          . Nesta simulação nenhuma cobrança é feita.
        </Title>
      </div>

      <OrderSummary plan={plan} cycle={checkout.cycle} />
    </div>
  );
}
