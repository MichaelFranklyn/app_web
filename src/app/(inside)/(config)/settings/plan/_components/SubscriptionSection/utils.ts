import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";

import { MySubscription, SubscriptionCopy } from "./interface";

export const CANCEL_FALLBACK_MESSAGE =
  "Não foi possível cancelar agora. Tente de novo em alguns minutos.";

/** "R$ 99,90 por mês" — ou nada, se o valor não veio. */
export function describePrice(sub: MySubscription): string {
  if (sub.value === null || sub.value === undefined) return "";
  const amount = formatMoney(Number(sub.value));
  if (!amount) return "";
  return `${amount} ${sub.cycle === "YEARLY" ? "por ano" : "por mês"}`;
}

/** Só links https saem da tela: o link vem do sistema de pagamento. */
export function isSafePaymentUrl(
  url: string | null | undefined
): url is string {
  return typeof url === "string" && url.startsWith("https://");
}

function paidUntilSentence(sub: MySubscription): string {
  return sub.paidUntil
    ? `Seu acesso está pago até ${formatDate(sub.paidUntil)}.`
    : "";
}

function joinSentences(...parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * O que a faixa da assinatura diz e quais botões oferece, por situação. Uma
 * frase curta por estado: o público lê devagar e precisa saber o que fazer.
 */
export function describeSubscription(sub: MySubscription): SubscriptionCopy {
  const hasInvoice = isSafePaymentUrl(sub.invoiceUrl);
  const price = describePrice(sub);
  const plan = sub.planLabel ? `Plano ${sub.planLabel}` : "Assinatura";

  if (!sub.isBillingEnabled) {
    return {
      variant: "neutral",
      title: "Pagamento",
      description: joinSentences(
        paidUntilSentence(sub),
        "Para assinar ou mudar de plano, fale com o suporte."
      ),
      canPay: false,
      canSubscribe: false,
      canCancel: false,
    };
  }

  switch (sub.status) {
    case "ACTIVE":
      return {
        variant: "success",
        title: `${plan}: em dia`,
        description: joinSentences(
          paidUntilSentence(sub),
          price && `A renovação é automática: ${price}.`,
          "Para mudar de plano, cancele esta assinatura e assine o novo."
        ),
        canPay: false,
        canSubscribe: false,
        canCancel: true,
      };
    case "PENDING":
      return {
        variant: "warning",
        title: `${plan}: aguardando pagamento`,
        description: joinSentences(
          price && `Valor: ${price}.`,
          hasInvoice
            ? "Toque em Pagar para escolher cartão, Pix ou boleto."
            : "Se já pagou com boleto, a confirmação leva até 3 dias úteis."
        ),
        canPay: hasInvoice,
        canSubscribe: false,
        canCancel: true,
      };
    case "OVERDUE":
      return {
        variant: "error",
        title: `${plan}: pagamento atrasado`,
        description: joinSentences(
          sub.overdueSince
            ? `A cobrança venceu em ${formatDate(sub.overdueSince)}.`
            : "Há uma cobrança vencida.",
          "Pague para não perder o acesso."
        ),
        canPay: hasInvoice,
        canSubscribe: false,
        canCancel: true,
      };
    case "CANCELED":
      return {
        variant: "info",
        title: "Assinatura cancelada",
        description: joinSentences(
          paidUntilSentence(sub),
          "Não haverá novas cobranças. Você pode assinar de novo quando quiser."
        ),
        canPay: false,
        canSubscribe: true,
        canCancel: false,
      };
    default:
      return {
        variant: "info",
        title: "Sem assinatura",
        description: joinSentences(
          paidUntilSentence(sub),
          "Assine para continuar usando o Itinus depois do período de teste."
        ),
        canPay: false,
        canSubscribe: true,
        canCancel: false,
      };
  }
}

/** Para onde o botão Assinar leva: o checkout com o plano atual já marcado. */
export function subscribeHref(planCode: string | null | undefined): string {
  return planCode
    ? `/assinar?plano=${encodeURIComponent(planCode)}`
    : "/assinar";
}
