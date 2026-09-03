/**
 * Acordo do ESCRITÓRIO com o vendedor numa fábrica — outro nível de comissão,
 * independente do que a fábrica paga ao escritório.
 *
 * Os dois campos têm nulo com significado: sem percentual o vendedor fica com a
 * comissão inteira (é como o sistema se comportava antes do acordo existir), e
 * sem base o repasse segue a mesma regra da fábrica.
 */

/** Valores canônicos: o campo é novo, não carrega o legado "Faturado"/"Pedido". */
export const SELLER_BASIS_OPTIONS = [
  { value: "", label: "Igual à fábrica" },
  {
    value: "Faturamento",
    label: "Faturamento — repassa quando a fábrica fatura",
  },
  {
    value: "Pagamento",
    label: "Pagamento — repassa quando o cliente paga o boleto",
  },
];

export const sellerShareLabel = (share: string | number | null): string =>
  share === null || share === "" ? "100%" : `${Number(share)}%`;

export const sellerBasisLabel = (basis: string | null): string => {
  if (!basis) return "igual à fábrica";
  return basis.toLowerCase().startsWith("pag") ? "no boleto" : "no faturamento";
};

/** Resumo de uma linha da tabela: "50% · no boleto". */
export const sellerAgreementLabel = (
  share: string | number | null,
  basis: string | null
): string => `${sellerShareLabel(share)} · ${sellerBasisLabel(basis)}`;

// ── Prévia do acordo ─────────────────────────────────────────────────────────

/** Percentual como se escreve em português: 42.9 → "42,9". */
export const percentText = (value: number): string =>
  String(value).replace(".", ",");

/** Pedido de referência da prévia: número redondo, fácil de conferir de cabeça. */
export const PREVIEW_ORDER_AMOUNT = 10000;

export interface AgreementPreview {
  /** O pedido de exemplo (R$ 10.000). */
  orderAmount: number;
  /** O que a FÁBRICA paga de comissão nesse pedido. */
  factoryCommission: number;
  /** O que o vendedor recebe com o percentual digitado. */
  sellerAmount: number;
  /** O que sobra para o escritório. */
  officeAmount: number;
  /**
   * O percentual a digitar se o número informado for, na verdade, a taxa do
   * vendedor SOBRE O PEDIDO — nulo quando não há motivo para suspeitar.
   */
  suggestedShare: number | null;
}

/**
 * Quanto cada um leva num pedido de R$ 10.000, com o percentual digitado.
 *
 * Existe porque o campo pergunta uma coisa que se confunde com outra: ele quer
 * a fatia DA COMISSÃO (metade dela = 50), e é natural digitar ali a taxa do
 * vendedor sobre o pedido (3, quando a fábrica paga 7). O rótulo e a dica já
 * avisavam e o engano aconteceu assim mesmo — dizer "R$ 21,00 para o vendedor"
 * é o que torna o erro visível, porque ninguém combina isso com um vendedor.
 *
 * `suggestedShare` faz a conversão: percentual digitado ÷ taxa da fábrica. Ele
 * só aparece quando o número digitado é menor ou igual à taxa da fábrica —
 * abaixo disso a fatia seria uma migalha da comissão, o que na prática não é
 * acordo nenhum, e acima disso não há nada a suspeitar.
 */
export const agreementPreview = (
  share: number | null,
  factoryRate: number
): AgreementPreview => {
  const orderAmount = PREVIEW_ORDER_AMOUNT;
  const factoryCommission = (orderAmount * factoryRate) / 100;
  // Nulo = 100%: o vendedor fica com a comissão inteira.
  const sellerAmount =
    share === null ? factoryCommission : (factoryCommission * share) / 100;

  const suspeito =
    share !== null && share > 0 && factoryRate > 0 && share <= factoryRate;

  return {
    orderAmount,
    factoryCommission,
    sellerAmount,
    officeAmount: factoryCommission - sellerAmount,
    suggestedShare: suspeito
      ? Math.round((share / factoryRate) * 1000) / 10
      : null,
  };
};
