import {
  ColumnChoice,
  parseNumber,
  valueForChoice,
} from "@/utils/import/columns";
import { parseSheetDate } from "@/utils/import/dates";
import { normalizeLabel, suggestMatch } from "@/utils/import/similarity";

import {
  HistoryOrderStatus,
  HistoryRowInput,
  MatchOption,
  RowProblem,
} from "../interface";
import { HistoryField, HistoryFieldKey, HistoryMapping } from "./interface";

/**
 * Os campos do histórico, na ordem em que a tela pergunta. Os palpites são os
 * títulos que a Mercos e as planilhas de representação costumam usar; a pessoa
 * confere e troca o que não bater.
 */
export const HISTORY_FIELDS: HistoryField[] = [
  {
    key: "orderDate",
    label: "Data do pedido",
    required: true,
    help: "O dia em que o cliente fez o pedido. É com ela que o sistema aprende de quanto em quanto tempo ele compra.",
    guesses: [
      "data",
      "data do pedido",
      "data de emissao",
      "emissao",
      "data emissao",
      "dt pedido",
    ],
  },
  {
    key: "clientDocument",
    label: "CNPJ do cliente",
    required: true,
    help: "CNPJ (ou CPF) do cliente. Cliente que ainda não está em Clientes pode ser criado pelo CNPJ no passo 3.",
    guesses: [
      "cnpj",
      "cnpj/cpf",
      "cpf/cnpj",
      "cnpj do cliente",
      "documento",
      "cpf",
    ],
  },
  {
    key: "clientName",
    label: "Nome do cliente",
    required: false,
    help: "A razão social do cliente. Só é usada para criar o cliente que ainda não está em Clientes.",
    guesses: ["razao social", "nome do cliente", "cliente"],
  },
  {
    key: "factory",
    label: "Fábrica",
    required: true,
    help: "A fábrica (representada) do pedido. No próximo passo você diz qual fábrica daqui é cada nome da planilha.",
    guesses: ["representada", "fabrica", "industria", "fornecedor", "empresa"],
  },
  {
    key: "seller",
    label: "Vendedor",
    required: false,
    help: "Quem vendeu. Sem esta coluna, todos os pedidos ficam no vendedor que você escolher no próximo passo.",
    guesses: ["vendedor", "representante", "usuario", "criado por"],
  },
  {
    key: "status",
    label: "Status do pedido",
    required: false,
    help: "Em que pé o pedido está (confirmado, faturado, entregue, cancelado…). No próximo passo você diz o que é cada status da planilha. Sem esta coluna, todos entram como entregues.",
    guesses: ["status", "situacao", "status do pedido", "situacao do pedido"],
  },
  {
    key: "externalRef",
    label: "Número do pedido",
    required: false,
    help: "O número do pedido no sistema antigo. Junta os itens do mesmo pedido e impede duplicar se você importar o arquivo duas vezes.",
    guesses: [
      "numero",
      "numero do pedido",
      "pedido",
      "n pedido",
      "no pedido",
      "nº pedido",
      "cod pedido",
      "codigo do pedido",
    ],
  },
  {
    key: "productCode",
    label: "Código do produto",
    required: false,
    help: "O código do produto na fábrica. É por ele que o sistema acha o produto no catálogo; sem código, tenta pelo nome.",
    guesses: [
      "codigo",
      "codigo do produto",
      "cod produto",
      "cod",
      "sku",
      "referencia",
      "ref",
    ],
  },
  {
    key: "productName",
    label: "Nome do produto",
    required: false,
    help: "A descrição do produto. Usada quando o código não bate com o catálogo.",
    guesses: [
      "produto",
      "descricao",
      "nome do produto",
      "descricao do produto",
      "nome",
    ],
  },
  {
    key: "quantity",
    label: "Quantidade",
    required: true,
    help: "Quanto o cliente levou daquele produto.",
    guesses: ["quantidade", "qtd", "qtde", "quant", "qtd vendida"],
  },
  {
    key: "unitPrice",
    label: "Preço unitário",
    required: false,
    help: "O preço de cada unidade. Precisa desta coluna ou do valor total.",
    guesses: [
      "preco",
      "preco unitario",
      "valor unitario",
      "preco liquido",
      "vlr unit",
      "preco unit",
    ],
  },
  {
    key: "total",
    label: "Valor total do item",
    required: false,
    help: "O valor total da linha, já com desconto. Quando vem, vale mais que o preço unitário.",
    guesses: [
      "total",
      "valor total",
      "subtotal",
      "total do item",
      "valor liquido",
      "total liquido",
    ],
  },
  {
    key: "invoiceNumber",
    label: "Número da nota fiscal",
    required: false,
    help: "O número da nota dos pedidos faturados e entregues.",
    guesses: [
      "nota fiscal",
      "numero da nota",
      "numero nf",
      "n nf",
      "nf",
      "nfe",
      "nf-e",
    ],
  },
  {
    key: "invoicedAt",
    label: "Data do faturamento",
    required: false,
    help: "O dia da nota. É dela que contam os vencimentos das parcelas; sem esta coluna, vale a data do pedido.",
    guesses: [
      "data de faturamento",
      "data do faturamento",
      "data faturamento",
      "data da nota",
      "data nf",
      "faturado em",
    ],
  },
  {
    key: "paymentTerms",
    label: "Condição de pagamento",
    required: false,
    help: 'O prazo do pedido, como "30/60/90". Dele saem as parcelas que ainda vão vencer; sem esta coluna, vale o prazo cadastrado na fábrica.',
    guesses: [
      "condicao de pagamento",
      "condicao pagamento",
      "prazo de pagamento",
      "prazo",
      "condicao",
    ],
  },
];

/**
 * Palavras que denunciam o status, da mais forte à mais fraca: "Faturado
 * parcialmente" é faturado, "Pedido cancelado" é cancelado. O que não cair em
 * nenhuma (orçamento, rascunho) fica sem par — a pessoa decide.
 */
const STATUS_HINTS: [RegExp, HistoryOrderStatus][] = [
  [/cancel/, "CANCELLED"],
  [/entreg/, "DELIVERED"],
  [/fatur|nota emitida/, "INVOICED"],
  [/envia|transmit/, "SENT_TO_FACTORY"],
  [/confirm|aprovad|liberad|^pedido$/, "CONFIRMED"],
];

export const guessStatusMatches = (
  values: string[]
): Record<string, string | null> =>
  Object.fromEntries(
    values.map((value) => {
      const text = normalizeLabel(value);
      return [value, STATUS_HINTS.find(([re]) => re.test(text))?.[1] ?? null];
    })
  );

const NONE: ColumnChoice = { kind: "none" };

/**
 * Primeiro palpite de coluna para cada campo. Título igual vence título
 * que contém a expressão, e cada coluna serve a um campo só — senão "Código" acabaria sendo
 * o número do pedido e o código do produto ao mesmo tempo.
 */
export const guessMapping = (headers: string[]): HistoryMapping => {
  const normalized = headers.map((h) => normalizeLabel(h).replace(/[.:]/g, ""));
  const used = new Set<number>();
  const mapping = {} as HistoryMapping;

  const pick = (field: HistoryField, exact: boolean): number => {
    for (const guess of field.guesses) {
      const index = normalized.findIndex(
        (h, i) =>
          !used.has(i) &&
          // Palavra solta só casa com título idêntico: "nome" dentro de "nome
          // fantasia" ou "total" dentro de "total do pedido" é outro campo.
          (exact || !guess.includes(" ") ? h === guess : h.includes(guess))
      );
      if (index >= 0) return index;
    }
    return -1;
  };

  for (const exact of [true, false]) {
    for (const field of HISTORY_FIELDS) {
      if (mapping[field.key]?.kind === "column") continue;
      const index = pick(field, exact);
      if (index >= 0) {
        used.add(index);
        mapping[field.key] = { kind: "column", index };
      }
    }
  }
  for (const field of HISTORY_FIELDS) mapping[field.key] ??= NONE;
  return mapping;
};

/** O que falta mapear antes de seguir, em linguagem da tela. */
export const missingFields = (mapping: HistoryMapping): string[] => {
  const missing = HISTORY_FIELDS.filter(
    (f) => f.required && mapping[f.key].kind === "none"
  ).map((f) => f.label);
  if (
    mapping.productCode.kind === "none" &&
    mapping.productName.kind === "none"
  ) {
    missing.push("Código ou nome do produto");
  }
  if (mapping.unitPrice.kind === "none" && mapping.total.kind === "none") {
    missing.push("Preço unitário ou valor total");
  }
  return missing;
};

/** Para cada valor da planilha, a opção existente mais parecida (ou nada). */
export const guessMatches = (
  values: string[],
  options: MatchOption[]
): Record<string, string | null> => {
  const labels = options.map((o) => o.label);
  return Object.fromEntries(
    values.map((value) => {
      const label = suggestMatch(value, labels);
      const id =
        options.find((o) => o.label === label)?.id ??
        containedMatch(value, options);
      return [value, id];
    })
  );
};

const words = (text: string): string[] =>
  normalizeLabel(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/**
 * "HERC PLASTICOS" na planilha e "Herc" no cadastro: letra a letra são pouco
 * parecidos, mas um nome está inteiro dentro do outro. Vale só quando UMA opção
 * cabe — "Tigre" contra "Tigre Tubos" e "Tigre Metais" continua sem palpite.
 */
const containedMatch = (
  value: string,
  options: MatchOption[]
): string | null => {
  const valueWords = words(value);
  const fits = options.filter((option) => {
    const optionWords = words(option.label);
    if (optionWords.length === 0 || valueWords.length === 0) return false;
    const [shorter, longer] =
      optionWords.length <= valueWords.length
        ? [optionWords, valueWords]
        : [valueWords, optionWords];
    return shorter.every((word) => longer.includes(word));
  });
  return fits.length === 1 ? fits[0].id : null;
};

const numberOrNull = (text: string): string | null => {
  if (!text.trim()) return null;
  const value = parseNumber(text);
  return Number.isFinite(value) ? String(value) : null;
};

interface BuildInput {
  rows: string[][];
  /** Número da linha do cabeçalho no arquivo (0-based) — para o resumo. */
  headerIndex: number;
  mapping: HistoryMapping;
  factoryByValue: Record<string, string | null>;
  sellerByValue: Record<string, string | null>;
  statusByValue: Record<string, string | null>;
  /** Vendedor de todos os pedidos, quando a planilha não tem a coluna. */
  defaultSellerId: string | null;
}

/**
 * As linhas da planilha no formato da mutation. O que já dá para saber que não
 * entra (data ilegível, fábrica sem par) sai aqui mesmo, com o número da linha
 * como o Excel mostra — a pessoa vai procurar a linha lá.
 */
export const buildRows = ({
  rows,
  headerIndex,
  mapping,
  factoryByValue,
  sellerByValue,
  statusByValue,
  defaultSellerId,
}: BuildInput): { rows: HistoryRowInput[]; problems: RowProblem[] } => {
  const out: HistoryRowInput[] = [];
  const problems: RowProblem[] = [];
  const get = (key: HistoryFieldKey, cells: string[]) =>
    valueForChoice(mapping[key], cells).trim();

  rows.forEach((cells, i) => {
    const row = headerIndex + i + 2;
    const orderDate = parseSheetDate(get("orderDate", cells));
    if (!orderDate) {
      problems.push({ row, message: "Data do pedido ilegível." });
      return;
    }
    const factoryId = factoryByValue[get("factory", cells)] ?? null;
    if (!factoryId) {
      problems.push({ row, message: "Fábrica sem correspondente escolhido." });
      return;
    }
    const sellerId =
      mapping.seller.kind === "none"
        ? defaultSellerId
        : (sellerByValue[get("seller", cells)] ?? null);
    if (!sellerId) {
      problems.push({ row, message: "Vendedor sem correspondente escolhido." });
      return;
    }
    const status =
      mapping.status.kind === "none"
        ? "DELIVERED"
        : ((statusByValue[get("status", cells)] ??
            null) as HistoryOrderStatus | null);
    if (!status) {
      problems.push({ row, message: "Status sem correspondente escolhido." });
      return;
    }
    const quantity = numberOrNull(get("quantity", cells));
    if (!quantity) {
      problems.push({ row, message: "Quantidade ilegível." });
      return;
    }
    out.push({
      row,
      externalRef: get("externalRef", cells) || null,
      clientDocument: get("clientDocument", cells),
      factoryId,
      sellerId,
      orderDate,
      productCode: get("productCode", cells) || null,
      productName: get("productName", cells) || null,
      quantity,
      unitPrice: numberOrNull(get("unitPrice", cells)),
      total: numberOrNull(get("total", cells)),
      status,
      clientName: get("clientName", cells) || null,
      invoiceNumber: get("invoiceNumber", cells) || null,
      // Data de nota ilegível vale como ausente: o servidor usa a do pedido.
      invoicedAt: parseSheetDate(get("invoicedAt", cells)),
      paymentTerms: get("paymentTerms", cells) || null,
    });
  });
  return { rows: out, problems };
};
