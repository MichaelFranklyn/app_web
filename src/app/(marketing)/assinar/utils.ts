import { ANNUAL_BILLED_MONTHS, MarketingPlan, PLANS } from "../plans";
import { BillingCycle, CardData, ChargeOutcome } from "./interface";

/**
 * Regras do checkout SIMULADO. Nada aqui fala com gateway nenhum — quando a
 * integração real chegar, é este arquivo que troca de dono: os componentes só
 * conhecem `simulateCharge` e as funções de validação.
 */

/** Plano da URL. Volta `null` para código desconhecido, e a página trata isso
 * mostrando a lista em vez de um checkout vazio. */
export function findPlanByCode(code: string | null): MarketingPlan | null {
  if (!code) return null;
  return PLANS.find((plan) => plan.code === code) ?? null;
}

/** O que a assinatura custaria no ciclo escolhido. Anual cobra
 * `ANNUAL_BILLED_MONTHS` meses por doze de uso. */
export function totalForCycle(
  plan: MarketingPlan,
  cycle: BillingCycle
): number | null {
  if (plan.demoMonthlyPrice === null) return null;

  return cycle === "annual"
    ? plan.demoMonthlyPrice * ANNUAL_BILLED_MONTHS
    : plan.demoMonthlyPrice;
}

/** Só dígitos, para comparar cartão e conferir tamanho. */
const digitsOf = (value: string): string => value.replace(/\D/g, "");

/**
 * Cartões da simulação. São os números de teste públicos que praticamente todo
 * gateway usa — ninguém emite cartão real com eles, e quem já integrou
 * pagamento os reconhece de imediato.
 */
export const DEMO_CARDS = {
  approved: "4242 4242 4242 4242",
  declined: "4000 0000 0000 0002",
};

/**
 * O veredicto da cobrança de mentira.
 *
 * O cartão de recusa existe para o estado de erro ser exercitável: uma
 * simulação que só sabe dar certo esconde justamente a tela que mais precisa
 * ser testada antes de plugar o gateway.
 */
export function simulateCharge(card: CardData): ChargeOutcome {
  return digitsOf(card.number) === digitsOf(DEMO_CARDS.declined)
    ? "declined"
    : "approved";
}

/** Mesma ideia para o cartão. A validação é de FORMATO — número de cartão de
 * verdade quem confere é a operadora, e aqui não há operadora nenhuma. */
export function validateCard(data: CardData): Partial<CardData> {
  const errors: Partial<CardData> = {};

  if (digitsOf(data.number).length !== 16) {
    errors.number = "O número do cartão precisa ter 16 dígitos.";
  }

  if (data.holder.trim().length < 3) {
    errors.holder = "Informe o nome impresso no cartão.";
  }

  if (!/^\d{2}\/\d{2}$/.test(data.expiry)) {
    errors.expiry = "Use o formato MM/AA.";
  }

  if (digitsOf(data.cvv).length < 3) {
    errors.cvv = "O código de segurança tem 3 dígitos.";
  }

  return errors;
}
