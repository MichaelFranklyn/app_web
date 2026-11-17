/** Ciclo de cobrança escolhido no checkout. */
export type BillingCycle = "monthly" | "annual";

/** Os passos do fluxo, na ordem. Os dados da empresa não são pedidos aqui: a
 * cobrança sai no nome e no CNPJ da conta de quem está logado. */
export type CheckoutStep = "plan" | "payment";

/** O que a server action devolve ao pedir a assinatura.
 *
 * - `redirect`: assinatura criada; o navegador segue para a página segura de
 *   pagamento (cartão, Pix ou boleto).
 * - `login`: ninguém logado (ou sessão vencida) — assinar exige a conta da
 *   empresa, porque é nela que o plano vai valer.
 * - `error`: recusa com mensagem para mostrar como está. */
export type StartSubscriptionResult =
  | { status: "redirect"; url: string }
  | { status: "login" }
  | { status: "error"; message: string };
