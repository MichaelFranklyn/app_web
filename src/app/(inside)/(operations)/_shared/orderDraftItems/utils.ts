import { SelectOption } from "@/components/Input";

import { DiscountType, DraftItem } from "./interface";

export const DISCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { value: "VALUE", label: "R$ (valor)" },
  { value: "PERCENT", label: "% (porcentagem)" },
];

/**
 * Converte o desconto digitado para reais — o backend só conhece desconto em
 * valor. Em porcentagem, incide sobre o valor bruto do item (preço × qtd), que
 * é a mesma base de que o subtotal é descontado.
 *
 * Arredonda em centavos: a porcentagem gera dízima com facilidade (3 × 33,33%)
 * e o subtotal do pedido é calculado no servidor a partir deste número.
 */
export const discountToAmount = (
  input: number,
  type: DiscountType,
  unitPrice: number,
  quantity: number
): number => {
  if (!input || input <= 0) return 0;
  if (type === "VALUE") return input;
  const gross = unitPrice * quantity;
  return Math.round(gross * (input / 100) * 100) / 100;
};

/** Valor de um item já com o desconto aplicado. Nunca negativo. */
export const itemSubtotal = (
  unitPrice: number,
  quantity: number,
  discount: number
): number => Math.max(0, quantity * unitPrice - discount);

/**
 * Total da mercadoria no rascunho — sem IPI e sem frete.
 *
 * É a mesma base que o backend guarda em `orders.total_amount` (e de que a
 * comissão é calculada), por isso é ela que se compara com o valor mínimo da
 * condição de pagamento: o aviso na tela tem de bater com o que o servidor vai
 * cobrar na confirmação.
 */
export const draftTotal = (items: DraftItem[]): number =>
  items.reduce(
    (sum, item) =>
      sum + itemSubtotal(item.unitPrice, item.quantity, item.discount),
    0
  );

/** Rótulo do desconto de um item já adicionado (ex.: "5% (R$ 12,50)"). */
export const discountLabel = (
  amount: number,
  input: number,
  type: DiscountType,
  formatMoney: (value: number) => string
): string => {
  if (amount <= 0) return "—";
  if (type === "VALUE") return formatMoney(amount);
  return `${input}% (${formatMoney(amount)})`;
};
