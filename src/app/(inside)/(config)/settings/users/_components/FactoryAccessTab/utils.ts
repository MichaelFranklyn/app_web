/**
 * Acordo do ESCRITÓRIO com o vendedor numa fábrica — outro nível de comissão,
 * independente do que a fábrica paga ao escritório.
 *
 * O percentual do vendedor é sobre o PEDIDO ("o vendedor ganha 3%"), na mesma
 * base da comissão da fábrica: é o número que se combina na rua e o que o
 * escritório confere no dia a dia. O sistema não fala mais em percentual DA
 * COMISSÃO em lugar nenhum — decisão do usuário: dois percentuais para a mesma
 * coisa é o que fazia digitar um no campo do outro.
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

export const sellerRateLabel = (rate: string | number | null): string =>
  rate === null || rate === ""
    ? "comissão inteira"
    : `${percentText(Number(rate))}% do pedido`;

export const sellerBasisLabel = (basis: string | null): string => {
  if (!basis) return "igual à fábrica";
  return basis.toLowerCase().startsWith("pag") ? "no boleto" : "no faturamento";
};

/** Resumo de uma linha da tabela: "3% do pedido · no boleto". */
export const sellerAgreementLabel = (
  rate: string | number | null,
  basis: string | null
): string => `${sellerRateLabel(rate)} · ${sellerBasisLabel(basis)}`;

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
  /** O que sobra para o escritório — negativo quando o acordo passa da fábrica. */
  officeAmount: number;
}

/**
 * Quanto cada um leva num pedido de R$ 10.000, com o percentual digitado.
 *
 * Existe porque percentual sozinho não se confere: "3%" e "30%" ocupam o mesmo
 * espaço na tela e só o dinheiro denuncia qual dos dois foi digitado. Dizer
 * "R$ 300 para o vendedor, R$ 400 para o escritório" é o que faz o engano
 * aparecer antes de virar repasse.
 *
 * O escritório NO PREJUÍZO (taxa do vendedor acima da que a fábrica paga) não é
 * bloqueado: pode ser um acerto real, e quem decide é o escritório. A prévia
 * mostra o número negativo, que é o aviso mais claro que existe.
 */
export const agreementPreview = (
  rate: number | null,
  factoryRate: number
): AgreementPreview => {
  const orderAmount = PREVIEW_ORDER_AMOUNT;
  const factoryCommission = (orderAmount * factoryRate) / 100;
  // Nulo = o vendedor fica com a comissão inteira, seja ela qual for.
  const sellerAmount =
    rate === null ? factoryCommission : (orderAmount * rate) / 100;

  return {
    orderAmount,
    factoryCommission,
    sellerAmount,
    officeAmount: factoryCommission - sellerAmount,
  };
};
