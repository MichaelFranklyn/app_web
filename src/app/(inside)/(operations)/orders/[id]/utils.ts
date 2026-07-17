import { InstallmentStatus, OrderItemProductTax } from "./interface";

/**
 * Rótulo das alíquotas do item para a coluna de imposto (ex.: "IPI 3,25% + ST 12%").
 *
 * Descarta alíquota zero: a importação da tabela grava 0 nos produtos fora do
 * regime (coluna vazia/"---" da planilha), e mostrar "ST 0%" em centenas de
 * linhas só polui. Sem imposto, a coluna mostra "—".
 *
 * A alíquota vem do produto e é a nominal já gravada — para ST por MVA é a
 * mesma que sai na coluna ST da planilha da fábrica, que é o número que o
 * vendedor reconhece.
 */
export const taxRatesLabel = (
  taxes: OrderItemProductTax[] | undefined,
  formatNumber: (value: number) => string
): string => {
  const applied = (taxes ?? [])
    .filter((tax) => tax.taxRule && parseFloat(tax.rate) > 0)
    .map(
      (tax) => `${tax.taxRule!.name} ${formatNumber(parseFloat(tax.rate))}%`
    );
  return applied.length > 0 ? applied.join(" + ") : "—";
};

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
