import { InstallmentStatus } from "./interface";

/**
 * Extrai o value de um campo select-single do FormBuilder, que devolve o objeto
 * da opção (`{ value, label }`) — ou o value cru. Retorna "" quando vazio.
 */
export const selectValue = (raw: unknown): string => {
  if (raw && typeof raw === "object" && "value" in raw) {
    return String((raw as { value: unknown }).value ?? "");
  }
  return String(raw ?? "");
};

/**
 * Modo Pagamento: a fábrica paga a comissão conforme o cliente paga os boletos.
 * Espelha `is_payment_basis` do backend (aceita "Pagamento" e o legado "Pedido").
 */
export const isPaymentBasis = (basis: string | null | undefined): boolean => {
  if (!basis) return false;
  const norm = basis.normalize("NFKD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
  return norm.startsWith("pag") || norm.startsWith("pedido");
};

export const commissionModeLabel = (
  basis: string | null | undefined
): string => (isPaymentBasis(basis) ? "Pagamento" : "Faturamento");

export const INSTALLMENT_STATUS_LABEL: Record<InstallmentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELLED: "Cancelado",
};

/** Cor do Badge para o status da parcela. */
export const INSTALLMENT_STATUS_TONE: Record<
  InstallmentStatus,
  "neutral" | "green" | "red"
> = {
  PENDING: "neutral",
  PAID: "green",
  CANCELLED: "red",
};
