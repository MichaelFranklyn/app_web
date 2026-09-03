/**
 * Os rótulos da folha — e o contrato entre a ida e a volta.
 *
 * A leitura NÃO pode se guiar por número de linha: o leitor de planilhas do
 * projeto descarta linhas em branco (`blankrows: false`), então o CNPJ que foi
 * escrito na linha 4 volta na 3. E o vendedor ainda pode inserir uma linha.
 * Casar pelo texto do rótulo sobrevive aos dois casos — e faz o rótulo, que é
 * o que ele lê na tela, ser também o que o sistema procura.
 */

export const LABEL = {
  cnpj: "CNPJ DO CLIENTE",
  razaoSocial: "RAZÃO SOCIAL",
  fantasia: "FANTASIA",
  address: "ENDEREÇO",
  cityState: "CIDADE / UF",
  factory: "FÁBRICA",
  tier: "NÍVEL ACORDADO",
  paymentTerm: "PRAZO DE PAGAMENTO",
  freight: "FRETE",
  deliveryDays: "PRAZO DE ENTREGA (DIAS)",
  coverageDays: "DURA NA LOJA (DIAS)",
  notes: "OBSERVAÇÕES",
  total: "TOTAL DO PEDIDO",
} as const;

/** Cabeçalho da tabela de itens, na ordem das colunas. */
export const ITEM_LABEL = {
  sku: "CÓDIGO",
  description: "DESCRIÇÃO",
  pack: "EMBALAGEM",
  multiple: "MÚLT.",
  packQty: "QT. EMB.",
  unitsTotal: "QT. TOTAL",
  packPrice: "PREÇO EMB.",
  discount: "DESC. %",
  taxes: "IMPOSTOS %",
  total: "TOTAL",
} as const;

export const ITEM_HEADER_ROW = [
  ITEM_LABEL.sku,
  ITEM_LABEL.description,
  ITEM_LABEL.pack,
  ITEM_LABEL.multiple,
  ITEM_LABEL.packQty,
  ITEM_LABEL.unitsTotal,
  ITEM_LABEL.packPrice,
  ITEM_LABEL.discount,
  ITEM_LABEL.taxes,
  ITEM_LABEL.total,
];
