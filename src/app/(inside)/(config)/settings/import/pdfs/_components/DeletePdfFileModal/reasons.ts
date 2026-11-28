import { formatDateDMY, formatMoney, maskCNPJ } from "@/utils/format/masks";

import { PdfImportFile } from "../../interface";

/** Os motivos de tirar um PDF do lote — os mesmos do enum `OrderPdfDiscardReason`. */
export type PdfDiscardReason =
  | "WRONG_CLIENT"
  | "WRONG_PRICE"
  | "WRONG_ITEMS"
  | "WRONG_TERMS"
  | "WRONG_FILE"
  | "NOT_AN_ORDER"
  | "OTHER";

/**
 * Os motivos que NÃO são um campo lido errado. Os de leitura (cliente, preço,
 * itens, condição) o back deduz dos campos marcados.
 */
export const PDF_OTHER_REASONS: { value: PdfDiscardReason; label: string }[] = [
  { value: "WRONG_FILE", label: "Enviei o arquivo errado ou repetido" },
  { value: "NOT_AN_ORDER", label: "Não é um pedido" },
  { value: "OTHER", label: "Outro motivo" },
];

/** Enum `OrderPdfField` da API, pelo NOME. */
export type PdfField =
  | "CLIENT_DOCUMENT"
  | "CLIENT_CODE"
  | "ORDER_NUMBER"
  | "ORDER_DATE"
  | "PAYMENT_TERMS"
  | "ITEMS"
  | "ITEMS_TOTAL"
  | "IPI_TOTAL"
  | "ORDER_TOTAL";

export interface PdfFieldOption {
  value: PdfField;
  label: string;
  /** Exemplo do "Valor correto"; sem ele, o campo só se marca (os itens). */
  placeholder?: string;
}

export const PDF_WRONG_FIELDS: PdfFieldOption[] = [
  {
    value: "CLIENT_DOCUMENT",
    label: "CNPJ do cliente",
    placeholder: "Ex: 12.345.678/0001-95",
  },
  {
    value: "CLIENT_CODE",
    label: "Código do cliente",
    placeholder: "Ex: 23401",
  },
  {
    value: "ORDER_NUMBER",
    label: "Número do pedido",
    placeholder: "Ex: 142032099",
  },
  {
    value: "ORDER_DATE",
    label: "Data do pedido",
    placeholder: "Ex: 13/11/2026",
  },
  {
    value: "PAYMENT_TERMS",
    label: "Condição de pagamento",
    placeholder: "Ex: 28/35/42",
  },
  { value: "ITEMS", label: "Os itens (faltaram, sobraram ou vieram errados)" },
  {
    value: "ITEMS_TOTAL",
    label: "Valor dos itens, sem imposto",
    placeholder: "Ex: 1.500,00",
  },
  { value: "IPI_TOTAL", label: "Valor do IPI", placeholder: "Ex: 75,00" },
  { value: "ORDER_TOTAL", label: "Valor total", placeholder: "Ex: 1.575,00" },
];

const money = (value?: string | null) => (value ? formatMoney(value) : null);

/** O que a leitura achou no campo, como a pessoa vê; nulo se não achou. */
export function readFieldValue(
  field: PdfField,
  file: Pick<PdfImportFile, "header" | "items">
): string | null {
  const header = file.header;
  switch (field) {
    case "CLIENT_DOCUMENT":
      return header?.clientDocument ? maskCNPJ(header.clientDocument) : null;
    case "CLIENT_CODE":
      return header?.clientCode ?? null;
    case "ORDER_NUMBER":
      return header?.orderNumber ?? null;
    case "ORDER_DATE":
      return header?.orderDate ? formatDateDMY(header.orderDate) : null;
    case "PAYMENT_TERMS":
      return header?.paymentTerms ?? null;
    case "ITEMS": {
      const count = file.items?.length ?? 0;
      if (!count) return null;
      return count === 1 ? "1 item" : `${count} itens`;
    }
    case "ITEMS_TOTAL":
      return money(header?.totals?.items);
    case "IPI_TOTAL":
      return money(header?.totals?.ipi);
    case "ORDER_TOTAL":
      return money(header?.totals?.total);
  }
}

/** Os campos marcados: `{campo: valor digitado}`. */
export type WrongFieldsDraft = Partial<Record<PdfField, string>>;

/** O que vai à API: valor em branco não vai (só a marca). */
export function wrongFieldsInput(
  draft: WrongFieldsDraft
): { field: PdfField; value: string | null }[] {
  return PDF_WRONG_FIELDS.filter((option) => option.value in draft).map(
    (option) => ({
      field: option.value,
      value: draft[option.value]?.trim() || null,
    })
  );
}

/** Corta espaços; texto vazio não vai à API. O filtro do que faz sentido é do back. */
export function discardNote(note: string): string | null {
  const trimmed = note.trim();
  return trimmed ? trimmed : null;
}
