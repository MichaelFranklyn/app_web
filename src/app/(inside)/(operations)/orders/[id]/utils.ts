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

/**
 * Ordena itens de pedido para exibição na ORDEM DE CRIAÇÃO (mais antigo
 * primeiro). Na importação cada item é gravado com commit próprio, então o
 * created_at cresce na ordem da planilha — a tabela e o PDF saem na mesma ordem
 * do arquivo enviado, e itens adicionados à mão depois entram no fim.
 */
export const byCreatedAtAsc = <T extends { createdAt?: string | null }>(
  a: T,
  b: T
): number => (a.createdAt ?? "").localeCompare(b.createdAt ?? "");

/** Normaliza texto para busca: sem acento e em caixa baixa. */
export const normalizeSearch = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Casa o termo de busca com o CÓDIGO (SKU) ou o NOME do produto, por trecho e
 * sem acento. Termo vazio casa tudo (não filtra).
 */
export const matchesProductSearch = (
  product: { name?: string | null; sku?: string | null } | null | undefined,
  term: string
): boolean => {
  const needle = normalizeSearch(term.trim());
  if (!needle) return true;
  const name = normalizeSearch(product?.name ?? "");
  const sku = normalizeSearch(product?.sku ?? "");
  return name.includes(needle) || sku.includes(needle);
};

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
