/**
 * A volta: ler uma ficha preenchida.
 *
 * Só entra aqui o que o vendedor DIGITOU — CNPJ, fábrica, prazo, frete, prazos
 * em dias, código, quantidade e desconto. Descrição, preço e total são fórmula,
 * e fórmula não alimenta o banco: o SheetJS entrega o último valor calculado,
 * que num app que não recalculou vem vazio ou velho. O sistema recalcula tudo
 * com o catálogo do dia.
 *
 * Os ids (cliente, fábrica, vendedor) vêm das abas escondidas e do `_META`, e
 * não de uma busca por nome: nome de fábrica muda, CNPJ é redigitado errado, e
 * casar por texto acertaria o pedido no cliente errado sem avisar.
 */

import type { SheetMatrix, WorkbookData } from "@/utils/import/reader";

import { ITEM_LABEL, LABEL } from "./labels";
import {
  CATALOG_COL,
  CATALOG_SHEET,
  CLIENTS_SHEET,
  CLIENT_COL,
  FACTORIES_SHEET,
  FACTORY_COL,
  FORM_SHEET,
  META_SHEET,
} from "./layout";
import { ORDER_SHEET_FORMAT } from "./version";

export interface OrderSheetMeta {
  companyId: string;
  sellerId: string;
  sellerName: string;
  generatedAt: string;
  priceListIds: string[];
}

export interface OrderSheetItem {
  sku: string;
  /** Embalagens digitadas — o que o vendedor conta na loja. */
  packQty: number;
  /** A mesma quantidade em unidades, que é a base do pedido no sistema. */
  quantity: number;
  /** Desconto combinado, em %. Vira reais só depois de o preço ser recalculado. */
  discountPercent: number;
}

export interface OrderSheetRead {
  meta: OrderSheetMeta;
  clientId: string | null;
  cnpjDigits: string;
  /**
   * O nome do cliente como a ficha o mostra.
   *
   * Não serve para achar ninguém — quem identifica é o `clientId`, tirado da
   * aba escondida. Serve para ROTULAR: o select do wizard precisa de um texto
   * para exibir, e sem ele o campo aparece vazio mesmo com o cliente certo
   * dentro. Vem de fórmula, então pode chegar em branco numa ficha que nunca
   * foi recalculada; quem usa cai no CNPJ nesse caso.
   */
  razaoSocial: string;
  nomeFantasia: string;
  factoryId: string | null;
  factoryName: string;
  paymentTermName: string;
  freightType: string;
  deliveryEstimateDays: number | null;
  coverageDays: number | null;
  /** O que o vendedor anotou na coluna de extras — vira a observação do pedido. */
  notes: string;
  items: OrderSheetItem[];
}

/** Todo rótulo que a folha escreve — serve para saber onde um campo termina. */
const KNOWN_LABELS = new Set<string>(Object.values(LABEL));

/**
 * O valor de um campo do cabeçalho.
 *
 * Acha o rótulo em qualquer coluna e devolve o primeiro valor à direita dele.
 * Não é a coluna seguinte porque rótulo e valor são células MESCLADAS — só a
 * primeira do bloco traz conteúdo, as outras voltam vazias. E a varredura para
 * ao encontrar outro rótulo conhecido: o cabeçalho tem dois blocos lado a lado,
 * e um campo vazio à esquerda não pode devolver o valor do vizinho da direita.
 */
const labelled = (form: SheetMatrix, label: string): string => {
  for (const row of form) {
    const at = row.findIndex((c) => (c ?? "").trim() === label);
    if (at < 0) continue;
    for (const raw of row.slice(at + 1)) {
      const value = (raw ?? "").trim();
      if (!value) continue;
      return KNOWN_LABELS.has(value) ? "" : value;
    }
    return "";
  }
  return "";
};

const digits = (value: string) => value.replace(/\D/g, "");

/** Número no formato que o Excel exporta — vírgula decimal inclusive. */
const toNumber = (value: string): number => {
  const clean = value
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}\b)/g, "")
    .replace(",", ".");
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
};

const optionalInt = (value: string): number | null => {
  const parsed = toNumber(value);
  return parsed > 0 ? Math.round(parsed) : null;
};

/** Uma ficha nossa se identifica no `_META` — o resto é arquivo de fábrica. */
export const isOrderSheet = (workbook: WorkbookData): boolean =>
  Object.entries(readMetaPairs(workbook)).some(
    ([key, value]) => key === "formato" && value === ORDER_SHEET_FORMAT
  );

const readMetaPairs = (workbook: WorkbookData): Record<string, string> => {
  const matrix = workbook.sheets[META_SHEET];
  if (!matrix) return {};
  return Object.fromEntries(
    matrix.slice(1).map((row) => [(row[0] ?? "").trim(), (row[1] ?? "").trim()])
  );
};

/** Índice: CNPJ (só dígitos) → id do cliente, da aba escondida da carteira. */
const clientIdByCnpj = (workbook: WorkbookData): Map<string, string> => {
  const matrix = workbook.sheets[CLIENTS_SHEET] ?? [];
  return new Map(
    matrix
      .slice(1)
      .map((row) => [
        digits(row[CLIENT_COL.cnpj - 1] ?? ""),
        (row[CLIENT_COL.id - 1] ?? "").trim(),
      ])
      .filter(([cnpj, id]) => cnpj && id) as [string, string][]
  );
};

const factoryIdByName = (workbook: WorkbookData): Map<string, string> => {
  const matrix = workbook.sheets[FACTORIES_SHEET] ?? [];
  return new Map(
    matrix
      .slice(1)
      .map((row) => [
        (row[FACTORY_COL.name - 1] ?? "").trim(),
        (row[FACTORY_COL.id - 1] ?? "").trim(),
      ])
      .filter(([name, id]) => name && id) as [string, string][]
  );
};

/**
 * Unidades por embalagem, por `fábrica|código`.
 *
 * A conversão usa o catálogo que está DENTRO da ficha, e não o do servidor: é
 * essa a embalagem que o vendedor tinha na frente quando contou as caixas.
 */
const unitsPerPackByKey = (workbook: WorkbookData): Map<string, number> => {
  const matrix = workbook.sheets[CATALOG_SHEET] ?? [];
  return new Map(
    matrix
      .slice(1)
      .map((row) => [
        (row[CATALOG_COL.key - 1] ?? "").trim(),
        toNumber(row[CATALOG_COL.unitsPerPack - 1] ?? "1") || 1,
      ])
  );
};

/**
 * Os itens preenchidos.
 *
 * As colunas são achadas pelo texto do cabeçalho, não pela letra: assim a folha
 * pode ganhar uma coluna no futuro sem quebrar a leitura de fichas antigas.
 */
const readItems = (
  form: SheetMatrix,
  factoryName: string,
  unitsPerPack: Map<string, number>
): OrderSheetItem[] => {
  // O cabeçalho é a linha que traz CÓDIGO e QT. EMB. juntos: procurar só por
  // "CÓDIGO" acharia a coluna do catálogo se ela um dia aparecer antes.
  const headerIndex = form.findIndex(
    (cells) =>
      cells.some((c) => (c ?? "").trim() === ITEM_LABEL.sku) &&
      cells.some((c) => (c ?? "").trim() === ITEM_LABEL.packQty)
  );
  if (headerIndex < 0) return [];

  const header = form[headerIndex].map((c) => (c ?? "").trim());
  const columnOf = (label: string) => header.indexOf(label);
  const skuAt = columnOf(ITEM_LABEL.sku);
  const packQtyAt = columnOf(ITEM_LABEL.packQty);
  const discountAt = columnOf(ITEM_LABEL.discount);

  const items: OrderSheetItem[] = [];
  for (const row of form.slice(headerIndex + 1)) {
    // A linha do total fecha a tabela — o que vier depois não é item.
    if (row.some((c) => (c ?? "").trim() === LABEL.total)) break;

    const sku = (row[skuAt] ?? "").trim();
    const packQty = toNumber(row[packQtyAt] ?? "");
    // Linha sem código ou sem quantidade é linha em branco do formulário — não
    // é erro de preenchimento e não vale avisar sobre ela.
    if (!sku || packQty <= 0) continue;

    const perPack = unitsPerPack.get(`${factoryName}|${sku}`) ?? 1;
    items.push({
      sku,
      packQty,
      quantity: packQty * perPack,
      discountPercent: discountAt >= 0 ? toNumber(row[discountAt] ?? "") : 0,
    });
  }
  return items;
};

/** Lê uma ficha preenchida. Só chame depois de `isOrderSheet`. */
export const readOrderSheet = (workbook: WorkbookData): OrderSheetRead => {
  const meta = readMetaPairs(workbook);
  const form = workbook.sheets[FORM_SHEET] ?? [];

  const cnpjDigits = digits(labelled(form, LABEL.cnpj));
  const factoryName = labelled(form, LABEL.factory);

  return {
    meta: {
      companyId: meta.empresa ?? "",
      sellerId: meta.vendedor ?? "",
      sellerName: meta.vendedor_nome ?? "",
      generatedAt: meta.gerado_em ?? "",
      priceListIds: (meta.tabelas ?? "").split(",").filter(Boolean),
    },
    clientId: clientIdByCnpj(workbook).get(cnpjDigits) ?? null,
    cnpjDigits,
    razaoSocial: labelled(form, LABEL.razaoSocial),
    nomeFantasia: labelled(form, LABEL.fantasia),
    factoryId: factoryIdByName(workbook).get(factoryName) ?? null,
    factoryName,
    paymentTermName: labelled(form, LABEL.paymentTerm),
    freightType: labelled(form, LABEL.freight).toUpperCase(),
    deliveryEstimateDays: optionalInt(labelled(form, LABEL.deliveryDays)),
    coverageDays: optionalInt(labelled(form, LABEL.coverageDays)),
    notes: labelled(form, LABEL.notes),
    items: readItems(form, factoryName, unitsPerPackByKey(workbook)),
  };
};
