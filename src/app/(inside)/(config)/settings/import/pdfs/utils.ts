import { ThemeColor } from "@/lib/theme";

import {
  HistoryOrderStatus,
  HistoryResult,
  HistoryRowInput,
  RowProblem,
} from "../interface";
import {
  PdfFileOverride,
  PdfImportBatch,
  PdfImportFile,
  PdfRowsBuild,
} from "./interface";

/** Quantos PDFs sobem ao mesmo tempo: o servidor lê cada um na hora do envio. */
export const UPLOAD_CONCURRENCY = 2;
/** Igual ao limite do backend (`MAX_FILES_PER_BATCH`). */
export const MAX_PDF_FILES = 200;
export const MAX_PDF_SIZE_MB = 10;
/** Enquanto há PDF sendo lido, a tela pergunta de novo a cada tanto. */
export const POLL_INTERVAL_MS = 2500;

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

/** O vendedor de um PDF: o escolhido nele, o do lote ou o do cliente. */
export const fileSellerId = (
  batch: PdfImportBatch,
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null =>
  override?.sellerId ?? batch.sellerId ?? file.suggestedSellerId ?? null;

/** A data de um PDF: a corrigida na tela ou a lida do cabeçalho. */
export const fileOrderDate = (
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null => override?.orderDate ?? file.header?.orderDate ?? null;

/**
 * O CNPJ do cliente do PDF: o que o servidor resolveu (o do PDF ou, quando o
 * PDF só traz o código do cliente na fábrica, o do cadastro) ou o lido.
 */
export const fileClientDocument = (file: PdfImportFile): string | null =>
  file.clientDocument ?? file.header?.clientDocument ?? null;

/** O que impede um PDF lido de entrar, em palavras; nulo = pode entrar. */
export function fileBlocker(
  batch: PdfImportBatch,
  file: PdfImportFile,
  override?: PdfFileOverride
): string | null {
  if (!fileClientDocument(file)) {
    const code = file.header?.clientCode;
    return code
      ? `o PDF não traz o CNPJ, e nenhum cliente tem o código ${code} nesta fábrica. Cadastre o código no vínculo do cliente com a fábrica.`
      : "o PDF não traz o CNPJ nem o código do cliente.";
  }
  if (!file.items?.length) return "nenhum item foi lido do PDF.";
  if (!fileOrderDate(file, override)) return "informe a data do pedido.";
  if (!fileSellerId(batch, file, override))
    return "o cliente não tem vendedor nesta fábrica; escolha um.";
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
  overrides: Record<string, PdfFileOverride>
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
    if (file.status === "IMPORTED" || override?.skip) continue;
    if (file.status === "FAILED") {
      flag(file, file.error ?? "o PDF não pôde ser lido.");
      continue;
    }
    if (file.status === "PENDING") {
      flag(
        file,
        file.isStale
          ? "o envio caiu no meio; envie o PDF de novo ou deixe-o de fora."
          : "o PDF ainda não foi lido."
      );
      continue;
    }
    const blocker = fileBlocker(batch, file, override);
    if (blocker) {
      flag(file, blocker);
      continue;
    }
    const header = file.header!;
    const sellerId = fileSellerId(batch, file, override)!;
    const orderDate = fileOrderDate(file, override)!;
    const status = rowStatus(batch.defaultStatus, header.invoiceNumber);
    if (file.unreadableRows > 0) {
      flag(
        file,
        `${file.unreadableRows} linha(s) do PDF não foram lidas e ficam de fora; o resto do pedido entra.`
      );
    }
    fileRows[file.id] = [];
    for (const [index, item] of file.items!.entries()) {
      fileRows[file.id].push(next);
      labels[next] = `${file.fileName}, item ${index + 1}`;
      rows.push({
        row: next,
        externalRef: header.orderNumber || file.fileName,
        clientDocument: fileClientDocument(file)!,
        factoryId: batch.factoryId,
        sellerId,
        orderDate,
        productCode: item.code,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: null,
        status,
        clientName: file.clientName ?? header.clientName,
        invoiceNumber: header.invoiceNumber,
        invoicedAt: null,
        paymentTerms: header.paymentTerms,
        // A observação é do pedido: vai uma vez só, na primeira linha.
        notes: index === 0 ? (header.notes ?? null) : null,
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
  result: HistoryResult
): string[] {
  const digits = (value: string) => value.replace(/\D/g, "");
  const missing = new Set(result.missingClients.map((c) => digits(c.document)));
  const refused = new Set(result.issues.map((issue) => issue.row));
  const byId = new Map(files.map((f) => [f.id, f]));
  return build.fileIds.filter((id) => {
    const file = byId.get(id);
    const document = (file && fileClientDocument(file)) ?? "";
    if (missing.has(digits(document))) return false;
    return (build.fileRows[id] ?? []).some((row) => !refused.has(row));
  });
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
