"use client";

import { useEffect, useRef, useState } from "react";
import {
  BillingCycle,
  BillingData,
  CardData,
  ChargeOutcome,
  CheckoutStep,
} from "../../interface";
import { simulateCharge, validateCard } from "../../utils";

/** Quanto tempo a "cobrança" fica processando. Um gateway real leva alguns
 * segundos, e a espera existe para o estado de carregamento ser visto — sem
 * ela, o botão pisca e ninguém consegue avaliar a tela. */
const FAKE_PROCESSING_MS = 1800;

const EMPTY_BILLING: BillingData = {
  companyName: "",
  document: "",
  email: "",
};

const EMPTY_CARD: CardData = {
  number: "",
  holder: "",
  expiry: "",
  cvv: "",
};

/**
 * O estado do checkout simulado: em que passo está, o que já foi preenchido e
 * como terminou.
 *
 * Container fino + hook, como o resto do projeto: os componentes de passo só
 * recebem valores e callbacks, então dá para trocar a simulação pelo gateway
 * real mexendo aqui e em `utils.ts`, sem tocar em nenhuma tela.
 */
export function useCheckout() {
  const [step, setStep] = useState<CheckoutStep>("plan");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [billing, setBilling] = useState<BillingData>(EMPTY_BILLING);
  const [card, setCard] = useState<CardData>(EMPTY_CARD);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [outcome, setOutcome] = useState<ChargeOutcome | null>(null);

  // O timer precisa morrer com o componente: sair da página no meio do
  // processamento deixaria um `setState` agendado para um componente que não
  // existe mais.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const goToBilling = () => setStep("billing");

  // Quem valida os dados de cobrança é o formulário do passo (FormBuilder, com
  // as regras declaradas nos campos); aqui só se guarda o que ele já aprovou.
  const submitBilling = (next: BillingData) => {
    setBilling(next);
    setErrors({});
    setStep("payment");
  };

  const submitPayment = () => {
    const found = validateCard(card);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsProcessing(true);
    timerRef.current = setTimeout(() => {
      setOutcome(simulateCharge(card));
      setIsProcessing(false);
      setStep("result");
    }, FAKE_PROCESSING_MS);
  };

  /** Volta para o cartão depois de uma recusa, preservando o que já foi
   * digitado — repetir o cadastro inteiro por causa de um número trocado é o
   * tipo de atrito que faz o cliente desistir na hora de pagar. */
  const retryPayment = () => {
    setOutcome(null);
    setErrors({});
    setStep("payment");
  };

  return {
    step,
    cycle,
    setCycle,
    billing,
    card,
    setCard,
    errors,
    isProcessing,
    outcome,
    goToBilling,
    submitBilling,
    submitPayment,
    retryPayment,
    backToBilling: () => setStep("billing"),
    backToPlan: () => setStep("plan"),
  };
}
