import type { SelectOption } from "@/components/Input";
import { ThemeColor } from "@/lib/theme";
import { isValidCnpj } from "@/utils/document";
import { BRT_TIME_ZONE, formatDateAtTime } from "@/utils/format/date";
import { plural } from "@/utils/format/plural";

import {
  HistoryOrderStatus,
  HistoryResult,
  HistoryRowInput,
  MatchOption,
  RowProblem,
} from "../interface";
import {
  PdfCorrection,
  PdfDefaults,
  PdfClientMode,
  PdfFileOverride,
  PdfImportBatch,
  PdfImportFile,
  PdfRowsBuild,
} from "./interface";

/** Quantos PDFs sobem ao mesmo tempo: o servidor lê cada um na hora do envio. */
export const UPLOAD_CONCURRENCY = 2;
/** Igual ao limite do backend (`MAX_OPEN_FILES_PER_BATCH`): 20 PDFs abertos por lote. */
export const MAX_PDF_FILES = 20;

export const PDF_BATCHES_PATH = "/settings/import/pdfs";
export const NEW_PDF_BATCH_PATH = `${PDF_BATCHES_PATH}/new`;
export const pdfBatchPath = (id: string) => `${PDF_BATCHES_PATH}/${id}`;

export const MAX_PDF_SIZE_MB = 10;
/** Enquanto há PDF sendo lido, a tela pergunta de novo a cada tanto. */
export const POLL_INTERVAL_MS = 2500;

/**
 * Quantos PDFs ainda cabem no lote: como no backend (`_is_open`), ocupam vaga
 * os lidos à espera de importar e os que estão chegando agora.
 */
export const freePdfSlots = (files: PdfImportFile[]): number =>
  Math.max(
    0,
    MAX_PDF_FILES -
      files.filter(
        (f) => f.status === "READ" || (f.status === "PENDING" && !f.isStale)
      ).length
  );

/** As opções de fábrica/vendedor/situação no formato do `Input.Select`. */
export const toSelect = (options: MatchOption[]): SelectOption[] =>
  options.map((o) => ({ value: o.id, label: o.label }));

/** O id escolhido num `Input.Select` de escolha única (nulo = limpo). */
export const pickedId = (
  val: SelectOption | SelectOption[] | null
): string | null => {
  const opt = Array.isArray(val) ? val[0] : val;
  return opt && opt.value !== "" ? String(opt.value) : null;
};

/** SHA-256 em hex: o mesmo PDF enviado duas vezes não vira dois pedidos. */
export async function hashFile(
  file: Pick<Blob, "arrayBuffer">
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer()
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * O status de cada pedido: o do lote, a não ser que o PDF traga o número da
 * nota — aí ele já foi faturado, mesmo que o lote diga "confirmado".
 */
export function rowStatus(
  defaultStatus: HistoryOrderStatus,
  invoiceNumber: string | null
): HistoryOrderStatus {
  const beforeInvoice =
    defaultStatus === "CONFIRMED" || defaultStatus === "SENT_TO_FACTORY";
  return beforeInvoice && invoiceNumber ? "INVOICED" : defaultStatus;
}

/** Os padrões de um lote aberto antes da prévia (vendedor e situação no lote). */
export const batchDefaults = (batch: PdfImportBatch): PdfDefaults => ({
  sellerId: batch.sellerId,
  status: batch.defaultStatus,
});

/** O vendedor de um PDF: o escolhido nele, o de todos ou o do cliente. */
export const fileSellerId = (
  defaults: PdfDefaults,
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null =>
  override?.sellerId ?? defaults.sellerId ?? file.suggestedSellerId ?? null;

/**
 * A situação de um PDF: a escolhida nele ou a de todos — e, com o número da
 * nota no PDF, faturado em vez de confirmado (`rowStatus`).
 */
export const fileStatus = (
  defaults: PdfDefaults,
  file: PdfImportFile,
  override?: PdfFileOverride
): HistoryOrderStatus =>
  override?.status ??
  rowStatus(defaults.status, file.header?.invoiceNumber ?? null);

/** A data de um PDF: a corrigida na tela ou a lida do cabeçalho. */
export const fileOrderDate = (
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null => override?.orderDate ?? file.header?.orderDate ?? null;

/**
 * A condição de pagamento de um PDF: a digitada na tela (mesmo apagada — aí o
 * pedido vai sem condição) ou a lida do cabeçalho.
 */
export const filePaymentTerms = (
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null => {
  const typed = override?.paymentTerms;
  if (typed !== undefined) return typed?.trim() || null;
  return file.header?.paymentTerms ?? null;
};

/**
 * O que a condição digitada vira na importação, para o campo explicar. `error`
 * quando não há dias no texto: o pedido entraria como se não tivesse condição.
 */
export const paymentTermsHint = (
  text: string | null
): { message: string; error: boolean } => {
  if (!text)
    return {
      message:
        "Em branco: o pedido faturado usa o prazo cadastrado na fábrica.",
      error: false,
    };
  const days = paymentTermDays(text);
  if (!days)
    return {
      message: "Não deu para ler os dias. Escreva como 30/60/90 ou à vista.",
      error: true,
    };
  const label =
    days.length === 1 && days[0] === 0 ? "à vista" : `${days.join("/")} dias`;
  return {
    message: `Prazo de ${label}. Se a fábrica não tiver, ele é cadastrado nela.`,
    error: false,
  };
};

/** O maior prazo de parcela que o backend aceita (`MAX_PAYMENT_DAYS`). */
const MAX_PAYMENT_DAYS = 720;

/**
 * Os dias de uma condição escrita, como o backend lê (`parse_payment_days`):
 * "30/60/90 DDL" é [30, 60, 90]; "à vista" é [0]. Nulo quando não há dias.
 */
export const paymentTermDays = (text: string | null): number[] | null => {
  const normalized = (text ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  const numbers = (normalized.match(/\d+/g) ?? []).map(Number);
  if (!numbers.length) return /\bA ?VISTA\b/.test(normalized) ? [0] : null;
  if (numbers.some((n) => n > MAX_PAYMENT_DAYS)) return null;
  return numbers.sort((a, b) => a - b);
};

/**
 * O CNPJ que o próprio PDF identifica: o que o servidor resolveu (o do PDF ou,
 * quando o PDF só traz o código do cliente na fábrica, o do cadastro) ou o lido.
 */
const pdfClientDocument = (file: PdfImportFile): string | null =>
  file.clientDocument ?? file.header?.clientDocument ?? null;

/** Sem CNPJ nem código que case: a prévia pede o cliente (existente ou novo). */
export const fileNeedsClient = (file: PdfImportFile): boolean =>
  file.status === "READ" && !pdfClientDocument(file);

/** O CNPJ do cliente do PDF: o identificado pelo PDF ou o digitado na prévia. */
export const fileClientDocument = (
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null =>
  pdfClientDocument(file) ??
  (fileNeedsClient(file) ? (override?.clientDocument ?? null) : null);

/** Como a prévia aponta o cliente do PDF sem CNPJ (padrão: carteira). */
export const fileClientMode = (override?: PdfFileOverride): PdfClientMode =>
  override?.clientMode ?? "wallet";

/** O nome do cliente: o do cadastro, o escolhido na carteira ou o lido do PDF. */
export const fileClientName = (
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null =>
  file.clientName ??
  (fileNeedsClient(file) && fileClientMode(override) === "wallet"
    ? (override?.clientName ?? null)
    : null) ??
  file.header?.clientName ??
  null;

/** O código do cliente na fábrica: o digitado na prévia ou o lido do PDF. */
export const fileClientCode = (
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null => {
  const typed = override?.clientCode;
  if (typed !== undefined) return typed?.trim() || null;
  return file.header?.clientCode ?? null;
};

/** O cliente que falta acertar na prévia, em palavras; nulo = identificado. */
function clientBlocker(
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null {
  if (!fileNeedsClient(file)) return null;
  const document = override?.clientDocument;
  if (fileClientMode(override) === "typed" && document)
    return isValidCnpj(document) ? null : "informe um CNPJ válido.";
  if (fileClientMode(override) === "wallet" && override?.clientId && document)
    return null;
  const code = file.header?.clientCode;
  const ask =
    fileClientMode(override) === "wallet"
      ? "Escolha o cliente da carteira ou digite o CNPJ."
      : "Informe o CNPJ do cliente.";
  return code
    ? `o PDF não traz o CNPJ, e nenhum cliente tem o código ${code} nesta fábrica. ${ask}`
    : `o PDF não traz o CNPJ nem o código do cliente. ${ask}`;
}

/** A pessoa já mexeu no cliente deste PDF (escolheu, digitou ou limpou)? */
const touchedClient = (override?: PdfFileOverride): boolean =>
  override?.clientMode !== undefined ||
  override?.clientId !== undefined ||
  override?.clientDocument !== undefined;

/**
 * O acerto do PDF com o que a leitura aprendeu desta fábrica: a condição e o
 * cliente que a pessoa costuma pôr no lugar dos lidos entram como se ela os
 * tivesse posto — até ela mexer no campo (o que ela põe vence sempre).
 */
export function withSuggestions(
  file: PdfImportFile,
  override?: PdfFileOverride
): PdfFileOverride | undefined {
  let next = override;
  if (
    file.status === "READ" &&
    file.suggestedPaymentTerms &&
    override?.paymentTerms === undefined
  )
    next = { ...next, paymentTerms: file.suggestedPaymentTerms };
  const client = file.suggestedClient;
  if (client && fileNeedsClient(file) && !touchedClient(override))
    next = {
      ...next,
      clientMode: "wallet",
      clientId: client.id,
      clientName: client.name,
      clientDocument: client.document,
    };
  return next;
}

/** Os acertos de todos os PDFs, com as sugestões aplicadas. */
export const applySuggestions = (
  files: PdfImportFile[],
  overrides: Record<string, PdfFileOverride>
): Record<string, PdfFileOverride> => {
  const all: Record<string, PdfFileOverride> = { ...overrides };
  for (const file of files) {
    const next = withSuggestions(file, overrides[file.id]);
    if (next) all[file.id] = next;
  }
  return all;
};

/** O campo está com o valor aprendido (para a ficha avisar e oferecer desfazer). */
export const isSuggestedTerms = (
  file: PdfImportFile,
  override?: PdfFileOverride
): boolean =>
  Boolean(file.suggestedPaymentTerms) &&
  override?.paymentTerms === file.suggestedPaymentTerms;

export const isSuggestedClient = (
  file: PdfImportFile,
  override?: PdfFileOverride
): boolean =>
  Boolean(file.suggestedClient) &&
  fileNeedsClient(file) &&
  fileClientMode(override) === "wallet" &&
  override?.clientId === file.suggestedClient?.id;

/** Desfazer a sugestão: volta ao lido do PDF, e a leitura esquece o aprendido. */
export const undoTermsSuggestion = (file: PdfImportFile): PdfFileOverride => ({
  paymentTerms: file.header?.paymentTerms ?? null,
});

export const undoClientSuggestion = (): PdfFileOverride => ({
  clientMode: "wallet",
  clientId: null,
  clientName: null,
  clientDocument: null,
});

/**
 * O que a pessoa deixou na condição e no cliente dos PDFs importados, para a
 * leitura aprender (ou esquecer, quando ela voltou ao lido). Vai tudo: quem
 * decide o que é acerto é o servidor, que conhece o lido e o aprendido.
 */
export function buildPdfCorrections(
  files: PdfImportFile[],
  fileIds: string[],
  overrides: Record<string, PdfFileOverride>
): PdfCorrection[] {
  const wanted = new Set(fileIds);
  const corrections: PdfCorrection[] = [];
  for (const file of files) {
    if (!wanted.has(file.id)) continue;
    const override = overrides[file.id];
    corrections.push({
      fileId: file.id,
      field: "PAYMENT_TERMS",
      value: filePaymentTerms(file, override),
    });
    if (fileNeedsClient(file))
      corrections.push({
        fileId: file.id,
        field: "CLIENT",
        value: fileClientDocument(file, override),
      });
  }
  return corrections;
}

/** O que impede um PDF lido de entrar, em palavras; nulo = pode entrar. */
export function fileBlocker(
  defaults: PdfDefaults,
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null {
  const client = clientBlocker(file, override);
  if (client) return client;
  if (!file.items?.length) return "nenhum item foi lido do PDF.";
  if (!fileOrderDate(file, override)) return "informe a data do pedido.";
  if (!fileSellerId(defaults, file, override))
    return file.clientId
      ? "o cliente não tem vendedor ligado nesta fábrica. Escolha o vendedor deste pedido no campo Vendedor."
      : fileNeedsClient(file)
        ? "escolha o vendedor deste pedido no campo Vendedor."
        : "o cliente não está na carteira, então não há vendedor ligado a ele. Escolha o vendedor deste pedido no campo Vendedor.";
  return null;
}

/**
 * Transforma os PDFs lidos nas linhas do `importOrderHistory` (uma por item),
 * do mesmo jeito que a planilha. Cada linha ganha um rótulo ("pedido.pdf,
 * item 3") para o resumo apontar de onde veio cada problema.
 */
export function buildPdfRows(
  batch: PdfImportBatch,
  files: PdfImportFile[],
  overrides: Record<string, PdfFileOverride>,
  defaults: PdfDefaults = batchDefaults(batch)
): PdfRowsBuild {
  const rows: HistoryRowInput[] = [];
  const problems: RowProblem[] = [];
  const labels: Record<number, string> = {};
  const fileIds: string[] = [];
  const fileRows: Record<string, number[]> = {};
  let next = 1;

  const flag = (file: PdfImportFile, message: string) => {
    labels[next] = file.fileName;
    problems.push({ row: next, message });
    next += 1;
  };

  for (const file of files) {
    const override = overrides[file.id];
    if (file.status === "IMPORTED") continue;
    if (file.status === "FAILED") {
      flag(file, file.error ?? "o PDF não pôde ser lido.");
      continue;
    }
    if (file.status === "PENDING") {
      flag(
        file,
        file.isStale
          ? "o envio caiu no meio; envie o PDF de novo ou exclua-o do lote."
          : "o PDF ainda não foi lido."
      );
      continue;
    }
    const blocker = fileBlocker(defaults, file, override);
    if (blocker) {
      flag(file, blocker);
      continue;
    }
    const header = file.header!;
    const sellerId = fileSellerId(defaults, file, override)!;
    const orderDate = fileOrderDate(file, override)!;
    const status = fileStatus(defaults, file, override);
    // CNPJ digitado na prévia: se não estiver na carteira, o cliente nasce
    // na importação, com os dados da Receita (o backend usa o da carteira
    // quando ele já existe). O escolhido na carteira já existe.
    const createClient =
      fileNeedsClient(file) && fileClientMode(override) === "typed";
    // O código vai junto quando não foi ele que achou o cliente: o backend
    // grava no vínculo se estiver vazio e o código, livre.
    const factoryClientCode =
      file.clientMatchedBy === "FACTORY_CODE"
        ? null
        : fileClientCode(file, override);
    if (file.unreadableRows > 0) {
      flag(
        file,
        `${plural(file.unreadableRows, "linha do PDF não foi lida e fica", "linhas do PDF não foram lidas e ficam")} de fora; o resto do pedido entra.`
      );
    }
    fileRows[file.id] = [];
    for (const [index, item] of file.items!.entries()) {
      fileRows[file.id].push(next);
      labels[next] = `${file.fileName}, item ${index + 1}`;
      rows.push({
        row: next,
        externalRef: header.orderNumber || file.fileName,
        clientDocument: fileClientDocument(file, override)!,
        factoryId: batch.factoryId,
        sellerId,
        orderDate,
        productCode: item.code,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: null,
        status,
        clientName: fileClientName(file, override),
        invoiceNumber: header.invoiceNumber,
        invoicedAt: null,
        paymentTerms: filePaymentTerms(file, override),
        // A observação é do pedido: vai uma vez só, na primeira linha.
        notes: index === 0 ? (header.notes ?? null) : null,
        createClient,
        factoryClientCode,
        ipiRate: item.ipiRate,
      });
      next += 1;
    }
    fileIds.push(file.id);
  }
  return { rows, problems, labels, fileIds, fileRows };
}

/**
 * Os PDFs cujo pedido a importação gravou: ficam de fora os de cliente fora da
 * carteira e os que tiveram todos os itens recusados. Esses continuam "Lido",
 * para entrarem depois que o cliente (ou o produto) for cadastrado.
 */
export function importedFileIds(
  build: PdfRowsBuild,
  files: PdfImportFile[],
  result: HistoryResult,
  overrides: Record<string, PdfFileOverride> = {}
): string[] {
  const digits = (value: string) => value.replace(/\D/g, "");
  const missing = new Set(result.missingClients.map((c) => digits(c.document)));
  const refused = new Set(result.issues.map((issue) => issue.row));
  const byId = new Map(files.map((f) => [f.id, f]));
  return build.fileIds.filter((id) => {
    const file = byId.get(id);
    const document = (file && fileClientDocument(file, overrides[id])) ?? "";
    if (missing.has(digits(document))) return false;
    return (build.fileRows[id] ?? []).some((row) => !refused.has(row));
  });
}

/**
 * Soma quantidade × preço dos itens lidos (sem IPI). Nulo quando nenhum item
 * trouxe preço; `unpriced` conta os que ficaram sem, para a ficha avisar.
 */
export function fileItemsTotal(
  file: PdfImportFile
): { total: number; unpriced: number } | null {
  let total = 0;
  let priced = 0;
  let unpriced = 0;
  for (const item of file.items ?? []) {
    const qty = Number(item.quantity);
    const price = item.unitPrice == null ? NaN : Number(item.unitPrice);
    if (!isFinite(qty) || !isFinite(price)) {
      unpriced += 1;
      continue;
    }
    total += qty * price;
    priced += 1;
  }
  return priced > 0 ? { total, unpriced } : null;
}

export interface PdfFileAmounts {
  /** Σ quantidade × preço dos itens lidos, sem imposto. */
  items: number;
  /** IPI pelos itens (alíquota × subtotal) ou, sem alíquota, o do rodapé. */
  ipi: number;
  st: number;
  /** O que o cliente paga: o total do rodapé, ou itens + impostos. */
  total: number;
  unpriced: number;
  /** O subtotal impresso, quando a soma dos itens lidos não bate com ele. */
  printedItems: number | null;
}

const money = (text: string | null | undefined): number | null => {
  if (text == null) return null;
  const value = Number(text);
  return isFinite(value) ? value : null;
};

/**
 * Os valores do pedido: o preço do item no PDF é sem imposto, e o total do
 * rodapé é com. Mostrar só a soma dos itens faz parecer que o pedido saiu
 * mais barato; aqui o IPI e a ST entram, e o subtotal impresso confere a
 * leitura — se não bate, algum item saiu torto.
 */
export function fileAmounts(file: PdfImportFile): PdfFileAmounts | null {
  const read = fileItemsTotal(file);
  if (!read) return null;
  const totals = file.header?.totals;
  let ipiFromItems = 0;
  let hasRate = false;
  for (const item of file.items ?? []) {
    const rate = money(item.ipiRate);
    const qty = Number(item.quantity);
    const price = money(item.unitPrice);
    if (!rate || price == null || !isFinite(qty)) continue;
    hasRate = true;
    ipiFromItems += Math.round(qty * price * rate) / 100;
  }
  const ipi = hasRate ? ipiFromItems : (money(totals?.ipi) ?? 0);
  const st = money(totals?.st) ?? 0;
  const printedTotal = money(totals?.total);
  const printed = money(totals?.items);
  const tolerance = 0.01 * ((file.items?.length ?? 0) + 1);
  const mismatched =
    printed != null &&
    read.unpriced === 0 &&
    Math.abs(read.total - printed) > tolerance + 1e-9;
  return {
    items: read.total,
    ipi,
    st,
    total: printedTotal ?? read.total + ipi + st,
    unpriced: read.unpriced,
    printedItems: mismatched ? printed : null,
  };
}

/** Em que pé está o PDF, para a etiqueta da lista. */
export function fileBadge(file: PdfImportFile): {
  label: string;
  color: ThemeColor;
} {
  if (file.status === "PENDING")
    return file.isStale
      ? { label: "Leitura interrompida", color: "warning" }
      : { label: "Lendo", color: "blue" };
  if (file.status === "READ") return { label: "Lido", color: "green" };
  if (file.status === "FAILED") return { label: "Não lido", color: "red" };
  return { label: "Importado", color: "neutral" };
}

/**
 * Contagem do lote, com o plural certo: "1 lido", "3 lidos" — o "lido" com "(s)"
 * genérico lia como formulário (crítica de configurações, 23/11/2026).
 */
export function batchCounts(batch: PdfImportBatch): string {
  const parts = [plural(batch.totalFiles, "PDF no lote", "PDFs no lote")];
  if (batch.importedFiles)
    parts.push(plural(batch.importedFiles, "importado", "importados"));
  if (batch.readFiles) parts.push(plural(batch.readFiles, "lido", "lidos"));
  if (batch.failedFiles)
    parts.push(plural(batch.failedFiles, "não lido", "não lidos"));
  return parts.join(" · ");
}

/**
 * Em que pé está o lote. Dois lotes da mesma fábrica no mesmo dia eram cartões
 * idênticos; a situação (com a hora e o vendedor) é o que os distingue
 * (crítica de configurações, 23/11/2026).
 */
export function batchBadge(batch: PdfImportBatch): {
  label: string;
  color: ThemeColor;
} {
  if (batch.totalFiles === 0) return { label: "Vazio", color: "neutral" };
  if (batch.pendingFiles > 0) return { label: "Lendo", color: "blue" };
  if (batch.readFiles > 0) return { label: "Falta importar", color: "warning" };
  // Nada lendo nem esperando: o que dava para entrar já entrou (os não lidos,
  // se houver, aparecem na contagem ao lado).
  if (batch.importedFiles > 0) return { label: "Importado", color: "green" };
  return { label: "Não lido", color: "red" };
}

/** "17/11/2026 às 14:32", no fuso do escritório. */
export function batchOpenedAt(iso: string): string {
  return formatDateAtTime(iso, {
    withYear: true,
    timeZone: BRT_TIME_ZONE,
  });
}
