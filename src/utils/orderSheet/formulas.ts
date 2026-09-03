/**
 * As fórmulas da folha.
 *
 * Três restrições moldam tudo aqui:
 *
 * 1. **Só função clássica** — `VLOOKUP`, `MATCH`, `IFERROR`, `SUBSTITUTE`.
 *    Nada de `XLOOKUP` ou `FILTER`: a ficha tem de abrir igual no Excel 2016 da
 *    loja, no LibreOffice e no Google Sheets.
 * 2. **Erro não aparece como `#N/D`** — todo lookup é embrulhado. O que o
 *    vendedor lê é a linha de aviso, escrita em português.
 * 3. **Nada calculado aqui alimenta o banco.** O importador lê só o que foi
 *    digitado (CNPJ, fábrica, prazo, código, quantidade, desconto) e recalcula
 *    o resto com o catálogo do dia. Estas fórmulas existem para o vendedor
 *    mostrar o preço ao cliente, offline.
 */

import {
  CATALOG_COL,
  CATALOG_SHEET,
  CLIENTS_SHEET,
  CLIENT_COL,
  COL,
  HEAD,
  HEAD_COL,
  ITEMS,
  ITEMS_LAST,
  EXTRA,
  EXTRA_COL,
  LINKS_SHEET,
  LINK_COL,
  columnLetter,
} from "./layout";

// As três células que governam a folha inteira: o cliente resolve a carteira, a
// fábrica resolve o catálogo, e o nível (que sai das duas) resolve o preço. O
// nível fica na coluna extra, fora da área de impressão: ele é combinação com
// a fábrica, e a ficha é entregue ao cliente.
const cnpjCell = `$${HEAD_COL.leftValue}$${HEAD.cnpj}`;
const factoryCell = `$${HEAD_COL.rightValue}$${HEAD.factory}`;
const tierCell = `$${EXTRA_COL.value}$${EXTRA.tier}`;

/**
 * O CNPJ digitado, reduzido a dígitos.
 *
 * O vendedor digita como quiser: com máscara vira texto, sem máscara vira
 * número. `TEXT` iguala os dois casos e os `SUBSTITUTE` tiram a pontuação — a
 * coluna de busca do CLIENTES é só dígitos.
 */
export const CNPJ_KEY = `SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(TRIM(TEXT(${cnpjCell},"0")),".",""),"/",""),"-","")`;

/** Um dado do cliente, buscado pelo CNPJ. Vazio enquanto o CNPJ não casar. */
export const clientField = (column: number): string =>
  `IF(${cnpjCell}="","",IFERROR(VLOOKUP(${CNPJ_KEY},${CLIENTS_SHEET}!$A:$${columnLetter(
    CLIENT_COL.cityState
  )},${column},FALSE),""))`;

/**
 * O nível acordado deste cliente NESTA fábrica.
 *
 * A chave é `cnpj|fábrica` porque o nível é do vínculo, não do cliente: o mesmo
 * cliente pode ser Platina numa fábrica e Ouro na outra.
 */
export const tierFormula = (): string =>
  `IF(OR(${cnpjCell}="",${factoryCell}=""),"",IFERROR(VLOOKUP(${CNPJ_KEY}&"|"&${factoryCell},${LINKS_SHEET}!$A:$${columnLetter(
    LINK_COL.tier
  )},${LINK_COL.tier},FALSE),""))`;

/**
 * A linha de aviso do cabeçalho.
 *
 * Um caso de cada vez, na ordem em que o vendedor preenche — a primeira coisa
 * que falta é a que ele lê. Sem isto, um cliente sem vínculo com a fábrica
 * apareceria como uma coluna de preços vazia, sem explicação.
 */
export const headerWarningFormula = (): string => {
  const razao = `$${HEAD_COL.leftValue}$${HEAD.razaoSocial}`;
  return [
    `IF(${cnpjCell}="","Informe o CNPJ do cliente para começar.",`,
    `IF(${razao}="","Este CNPJ não está na sua carteira. Confira o número.",`,
    `IF(${factoryCell}="","Escolha a fábrica do pedido.",`,
    `IF(${tierCell}="","Este cliente não tem vínculo com esta fábrica: o preço não será preenchido.",`,
    `""))))`,
  ].join("");
};

/** Chave de busca do produto: o SKU só é único DENTRO da fábrica. */
const productKey = (row: number) => `${factoryCell}&"|"&${COL.sku}${row}`;

const catalogLastColumn = (priceColumns: number) =>
  columnLetter(CATALOG_COL.ncm + priceColumns);

/** Um campo fixo do catálogo (descrição, embalagem, múltiplo, impostos). */
export const productField = (
  row: number,
  column: number,
  priceColumns: number,
  fallback = ""
): string =>
  `IF(${COL.sku}${row}="","",IFERROR(VLOOKUP(${productKey(
    row
  )},${CATALOG_SHEET}!$A:$${catalogLastColumn(
    priceColumns
  )},${column},FALSE),"${fallback}"))`;

/** Quantidade em UNIDADES: embalagens digitadas × unidades por embalagem. */
export const unitsTotalFormula = (row: number, priceColumns: number): string =>
  `IF(OR(${COL.sku}${row}="",${COL.packQty}${row}=""),"",${
    COL.packQty
  }${row}*IFERROR(VLOOKUP(${productKey(row)},${CATALOG_SHEET}!$A:$${catalogLastColumn(
    priceColumns
  )},${CATALOG_COL.unitsPerPack},FALSE),1))`;

/**
 * O preço da embalagem no nível acordado.
 *
 * `MATCH` acha a coluna do nível pelo NOME na linha de cabeçalho do catálogo e
 * devolve a posição dentro da mesma faixa que o `VLOOKUP` varre — então trocar
 * o cliente troca a coluna de preço inteira, sem fórmula nova.
 */
export const priceFormula = (row: number, priceColumns: number): string => {
  const last = catalogLastColumn(priceColumns);
  return `IF(OR(${COL.sku}${row}="",${tierCell}=""),"",IFERROR(VLOOKUP(${productKey(
    row
  )},${CATALOG_SHEET}!$A:$${last},MATCH(${tierCell},${CATALOG_SHEET}!$A$1:$${last}$1,0),FALSE),""))`;
};

/**
 * O total da linha, como o cliente vai ouvir: mercadoria com o desconto
 * combinado, mais os impostos que a fábrica cobra por fora.
 */
export const lineTotalFormula = (row: number): string =>
  `IF(OR(${COL.packQty}${row}="",${COL.packPrice}${row}=""),"",${COL.packQty}${row}*${COL.packPrice}${row}*(1-IF(${COL.discount}${row}="",0,${COL.discount}${row})/100)*(1+IF(${COL.taxes}${row}="",0,${COL.taxes}${row})/100))`;

/** Soma da coluna de totais. */
export const grandTotalFormula = (): string =>
  `SUM(${COL.total}${ITEMS.first}:${COL.total}${ITEMS_LAST})`;
