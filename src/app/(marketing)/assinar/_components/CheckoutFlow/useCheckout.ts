"use client";

import { useState, useTransition } from "react";
import { startSubscriptionAction } from "../../actions";
import { BillingCycle, CheckoutStep } from "../../interface";

/**
 * O estado do checkout: em que passo está, o ciclo escolhido e como terminou o
 * pedido de assinatura.
 *
 * O pagamento em si NÃO acontece nesta tela: a action cria a assinatura e o
 * navegador segue para a página segura do sistema de pagamento, onde o cliente
 * escolhe cartão, Pix ou boleto. O cartão nunca passa pelo nosso servidor.
 */
export function useCheckout(planCode: string, users: number) {
  const [step, setStep] = useState<CheckoutStep>("plan");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const goToPayment = () => {
    setError(null);
    setStep("payment");
  };

  const backToPlan = () => {
    setError(null);
    setNeedsLogin(false);
    setStep("plan");
  };

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await startSubscriptionAction(planCode, cycle, users);

      if (result.status === "redirect") {
        // O botão segue carregando até a página nova abrir: sem isso ele
        // voltaria ao normal por um instante e convidaria a um segundo clique.
        setIsRedirecting(true);
        window.location.assign(result.url);
        return;
      }

      if (result.status === "login") {
        setNeedsLogin(true);
        return;
      }

      setError(result.message);
    });
  };

  return {
    step,
    cycle,
    setCycle,
    error,
    needsLogin,
    isSubmitting: isPending || isRedirecting,
    goToPayment,
    backToPlan,
    confirm,
  };
}
