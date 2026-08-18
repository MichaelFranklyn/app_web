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
