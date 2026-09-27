/**
 * Situação de um produto na cesta do cliente — a régua de `clientProductAnalysis`
 * (ficha do cliente) e do roteiro da visita. Os dois lugares falam a mesma
 * frase: "Hora de repor" na ficha não pode virar outra coisa no painel da visita.
 */
export type ProductPurchaseStatus =
  | "ON_TRACK"
  | "DUE"
  | "LATE"
  | "STOPPED"
  | "SINGLE";

/** Rótulos das situações — a frase que o vendedor lê, não o nome do enum. */
export const PURCHASE_STATUS_LABEL: Record<ProductPurchaseStatus, string> = {
  ON_TRACK: "Comprando normal",
  DUE: "Hora de repor",
  LATE: "Atrasado",
  STOPPED: "Parou de comprar",
  SINGLE: "Comprou uma vez",
};

export const PURCHASE_STATUS_COLOR: Record<
  ProductPurchaseStatus,
  "green" | "amber" | "red" | "neutral" | "blue"
> = {
  ON_TRACK: "green",
  DUE: "amber",
  LATE: "red",
  STOPPED: "neutral",
  SINGLE: "blue",
};

/** O que fazer com o produto, em uma frase. Vira o `title` da situação. */
export const PURCHASE_STATUS_HINT: Record<ProductPurchaseStatus, string> = {
  ON_TRACK:
    "O cliente comprou dentro do ritmo dele. Não precisa de atenção agora.",
  DUE: "Pelo ritmo de compra, o cliente já deve estar precisando. Ofereça.",
  LATE: "Passou do ritmo de compra. Vale perguntar o que aconteceu.",
  STOPPED:
    "O cliente comprava e deixou de comprar. Pode ter trocado de fornecedor.",
  SINGLE: "Comprou uma única vez. Ainda não há ritmo de compra para comparar.",
};

/** "há 12 dias" / "hoje" — o tempo como a pessoa conta. */
export const daysAgoLabel = (days: number): string => {
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
};

/** Quantidade em unidades, sem casas quando é inteira (o caso comum). */
export const unitsLabel = (value: string | number): string => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return Number.isInteger(num)
    ? String(num)
    : num.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
};
