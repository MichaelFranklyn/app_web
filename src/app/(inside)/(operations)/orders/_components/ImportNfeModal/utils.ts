import { ThemeColor } from "@/lib/theme";

import { NfeImportStatus } from "./interface";

/** Quantos arquivos por envio — o mesmo teto do backend (`MAX_FILES`). */
export const MAX_NFE_FILES = 50;

export const NFE_STATUS_LABEL: Record<NfeImportStatus, string> = {
  READY: "Pronto para faturar",
  NEEDS_REVIEW: "Conferir no pedido",
  ALREADY_IMPORTED: "Nota já importada",
  NOT_AUTHORIZED: "Nota não autorizada",
  UNKNOWN_FACTORY: "Fábrica não encontrada",
  UNKNOWN_CLIENT: "Cliente fora da carteira",
  NO_OPEN_ORDER: "Nenhum pedido esperando",
  INVALID: "Arquivo inválido",
};

export const NFE_STATUS_COLOR: Record<NfeImportStatus, ThemeColor> = {
  READY: "green",
  NEEDS_REVIEW: "amber",
  ALREADY_IMPORTED: "neutral",
  NOT_AUTHORIZED: "red",
  UNKNOWN_FACTORY: "red",
  UNKNOWN_CLIENT: "red",
  NO_OPEN_ORDER: "amber",
  INVALID: "red",
};

/** Só a nota pronta fatura daqui; o resto se resolve no pedido ou no cadastro. */
export const isInvoiceable = (status: NfeImportStatus): boolean =>
  status === "READY";

/** Onde a pessoa resolve a nota que não está pronta. */
export const orderLinkFor = (
  status: NfeImportStatus,
  orderId: string | null
): string | null =>
  orderId && (status === "NEEDS_REVIEW" || status === "ALREADY_IMPORTED")
    ? `/orders/${orderId}`
    : null;
