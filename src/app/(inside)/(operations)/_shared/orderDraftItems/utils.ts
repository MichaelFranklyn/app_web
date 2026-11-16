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

/** O que a mesclagem fez — vira a mensagem de quem importou. */
export interface DraftMergeResult {
  items: DraftItem[];
  added: number;
  updated: number;
}

/**
 * Junta itens que chegaram de uma vez (planilha) ao rascunho.
 *
 * A regra é uma só, e a tela diz qual: produto que JÁ está na lista fica onde
 * está, com o preço, o nível e o desconto que o vendedor deu, e passa a ter a
 * QUANTIDADE da planilha — a planilha é o pedido do cliente, e o preço é
 * decisão do vendedor. O desconto em % é recalculado para a quantidade nova;
 * o em reais continua o mesmo valor. Produto novo entra no topo, na ordem da
 * planilha — como o item digitado, que também entra no topo.
 *
 * O rascunho nunca tem o mesmo produto duas vezes (`submitItem` recusa), então
 * a chave é o produto, não produto+nível.
 */
export const mergeDraftItems = (
  current: DraftItem[],
  incoming: DraftItem[]
): DraftMergeResult => {
  const incomingByProduct = new Map(
    incoming.map((item) => [item.productId, item])
  );
  let updated = 0;
  const kept = current.map((item) => {
    const match = incomingByProduct.get(item.productId);
    if (!match) return item;
    updated += 1;
    return {
      ...item,
      quantity: match.quantity,
      discount: discountToAmount(
        item.discountInput,
        item.discountType,
        item.unitPrice,
        match.quantity
      ),
    };
  });
  const existing = new Set(current.map((item) => item.productId));
  const added = incoming.filter((item) => !existing.has(item.productId));
  return { items: [...added, ...kept], added: added.length, updated };
};
