import { EXTRA_USER_MONTHLY_PRICE, MarketingPlan, PLANS } from "./plans";

/**
 * A conta da mensalidade com usuários a mais (14/11/2026).
 *
 * Mora no pai do grupo porque tem dois consumidores: a calculadora da vitrine
 * (`PlansSection`) e o checkout (`/assinar`). Se cada um fizesse a própria
 * conta, o total da vitrine e o do resumo do pedido acabariam diferentes por
 * um centavo — e é exatamente esse o centavo que o cliente repara.
 *
 * A conta é feita em CENTAVOS inteiros: 54,90 + 24,90 em ponto flutuante dá
 * 79,80000000000001.
 */

/** Menor e maior quantidade que a calculadora aceita. Acima disso, a conversa é
 * de Enterprise, não de usuário extra. */
export const MIN_USERS = 1;
export const MAX_USERS = 30;

const toCents = (reais: number): number => Math.round(reais * 100);

/** Quantos usuários passam do que o plano já inclui. */
export function extraUsersFor(plan: MarketingPlan, users: number): number {
  if (plan.includedUsers === null) return 0;
  return Math.max(0, users - plan.includedUsers);
}

/** A mensalidade com `users` logins. `null` no plano sem preço de tabela. */
export function monthlyTotalFor(
  plan: MarketingPlan,
  users: number
): number | null {
  if (plan.demoMonthlyPrice === null) return null;

  const cents =
    toCents(plan.demoMonthlyPrice) +
    extraUsersFor(plan, users) * toCents(EXTRA_USER_MONTHLY_PRICE);

  return cents / 100;
}

/**
 * O plano de cima que sai MAIS BARATO (ou igual) para a mesma equipe — e que,
 * por ser de cima, ainda traz mais recursos. É a sugestão da calculadora.
 *
 * Só olha para cima: sugerir um plano de baixo por ser mais barato tiraria
 * recurso que o cliente escolheu ter.
 */
export function cheaperUpgradeFor(
  plan: MarketingPlan,
  users: number
): MarketingPlan | null {
  const current = monthlyTotalFor(plan, users);
  if (current === null) return null;

  const above = PLANS.slice(PLANS.indexOf(plan) + 1);

  for (const candidate of above) {
    const total = monthlyTotalFor(candidate, users);
    if (total !== null && total <= current) return candidate;
  }

  return null;
}

/** Quantidade de usuários lida da URL (`?usuarios=`). Sem valor, inválida ou
 * abaixo do que o plano inclui, vale o incluído — o checkout nunca cobra menos
 * que a mensalidade cheia. */
export function parseUsers(raw: string | null, plan: MarketingPlan): number {
  const included = plan.includedUsers ?? MIN_USERS;
  const parsed = Number.parseInt(raw ?? "", 10);

  if (!Number.isFinite(parsed)) return included;

  return Math.min(MAX_USERS, Math.max(included, parsed));
}
