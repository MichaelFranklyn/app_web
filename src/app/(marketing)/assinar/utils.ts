import { ANNUAL_BILLED_MONTHS, MarketingPlan, PLANS } from "../plans";
import { monthlyTotalFor } from "../pricing";
import { BillingCycle, StartSubscriptionResult } from "./interface";

/**
 * Regras do checkout que não falam com ninguém: achar o plano, mostrar o valor
 * e traduzir a resposta do backend. Quem decide QUANTO cobrar é o backend
 * (`app_user` `core/domain/billing.py`); o valor daqui é só vitrine.
 */

/** Plano da URL. Volta `null` para código desconhecido, e a página trata isso
 * mostrando a lista em vez de um checkout vazio. */
export function findPlanByCode(code: string | null): MarketingPlan | null {
  if (!code) return null;
  return PLANS.find((plan) => plan.code === code) ?? null;
}

/** O que a assinatura custa no ciclo escolhido, com `users` logins (os
 * usuários a mais entram na mensalidade). Anual cobra `ANNUAL_BILLED_MONTHS`
 * meses por doze de uso — a conta em centavos, como em `pricing.ts`. */
export function totalForCycle(
  plan: MarketingPlan,
  cycle: BillingCycle,
  users: number = plan.includedUsers ?? 1
): number | null {
  const monthly = monthlyTotalFor(plan, users);
  if (monthly === null) return null;

  return cycle === "annual"
    ? (Math.round(monthly * 100) * ANNUAL_BILLED_MONTHS) / 100
    : monthly;
}

/** Nome do ciclo no contrato GraphQL (`BillingCycle` do backend). */
export function toApiCycle(cycle: BillingCycle): "MONTHLY" | "YEARLY" {
  return cycle === "annual" ? "YEARLY" : "MONTHLY";
}

/** Logins além dos que o plano já inclui — é isso que o backend cobra à parte. */
export function extraUsersFor(plan: MarketingPlan, users: number): number {
  return Math.max(0, users - (plan.includedUsers ?? users));
}

export const START_FALLBACK_MESSAGE =
  "Não foi possível abrir o pagamento agora. Tente de novo em alguns minutos.";

export const NO_INVOICE_YET_MESSAGE =
  "A assinatura foi criada, mas a cobrança ainda está sendo preparada. Tente de novo em instantes.";

/** Mensagens com que o backend recusa quem não está logado ou tem a sessão
 * vencida (`UnauthorizedException`, `InvalidTokenException`), mais o
 * `UNAUTHORIZED` que o `gqlFetch` lança no 401/403 do HTTP. */
const SESSION_ERRORS = new Set([
  "UNAUTHORIZED",
  "Autenticação necessária",
  "Token inválido ou expirado",
]);

/**
 * Traduz o erro lançado pelo `gqlFetch` num resultado para a tela.
 *
 * Sessão ausente vira "entrar"; a mensagem de negócio do backend (já
 * humanizada: plano inválido, assinatura já ativa, só o responsável assina) é
 * mostrada como está; o resto — rede, 5xx, `NETWORK_ERROR: 502` — vira o
 * texto genérico, porque código técnico não ajuda quem está pagando.
 */
export function describeStartError(message: string): StartSubscriptionResult {
  if (SESSION_ERRORS.has(message)) return { status: "login" };

  const isTechnical =
    !message ||
    message.startsWith("NETWORK_ERROR") ||
    message === "Resource not found" ||
    message === "fetch failed";

  return {
    status: "error",
    message: isTechnical ? START_FALLBACK_MESSAGE : message,
  };
}

/** Só segue para página HTTPS: o link vem do nosso backend, mas é ele que
 * decide para onde o navegador do cliente vai na hora de pagar. */
export function isSafeInvoiceUrl(
  url: string | null | undefined
): url is string {
  return typeof url === "string" && url.startsWith("https://");
}
