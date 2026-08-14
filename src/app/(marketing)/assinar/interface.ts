/** Ciclo de cobrança escolhido no checkout. */
export type BillingCycle = "monthly" | "annual";

/** Os passos do fluxo, na ordem. `result` é o único que não volta atrás. */
export type CheckoutStep = "plan" | "billing" | "payment" | "result";

/** Quem está assinando. Campos mínimos de um cadastro de cobrança — o resto o
 * sistema já pergunta no `/signup`. */
export interface BillingData {
  companyName: string;
  document: string;
  email: string;
}

/** Dados do cartão digitados na SIMULAÇÃO. Nunca saem da memória do navegador:
 * não há requisição, armazenamento nem log em nenhum ponto do fluxo. */
export interface CardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

/** Veredicto da cobrança simulada. */
export type ChargeOutcome = "approved" | "declined";
