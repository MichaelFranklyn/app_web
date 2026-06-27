export const onlyDigits = (value: string): string => value.replace(/\D+/g, "");

// Mascara CPF: 000.000.000-00
export const maskCPF = (value: string): string => {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

// Mascara CNPJ: 00.000.000/0000-00
export const maskCNPJ = (value: string): string => {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

// Mascara telefone: (00) 00000-0000
export const maskPhoneBR = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

// Formata um número como moeda (R$)
export const formatMoney = (value: number | string): string => {
  if (typeof value === "string") {
    value = Number(value);
  }

  if (!isFinite(value)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
};

// Converte string de moeda para number
export const parseMoneyToNumber = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9,-]+/g, "").trim();
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return isFinite(n) ? n : 0;
};

// Formata um número com separadores de milhar
export const formatNumber = (value: number): string => {
  if (!isFinite(value)) return "";
  return new Intl.NumberFormat("pt-BR").format(value);
};

// Formata um valor com 2 casas decimais, sem símbolo de moeda (ex.: "1.234,56").
// Usado em tabelas que prefixam o "R$" no JSX.
export const formatAmount = (value: number | string): string =>
  Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Mascara CEP: 00000-000
export const maskCEP = (value: string): string => {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
};

// Mascara moeda BRL digitada: 1.234,56
export const maskCurrency = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 13);
  if (!digits) return "";
  const cents = digits.padStart(3, "0");
  const integer = cents.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const decimal = cents.slice(-2);
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted},${decimal}`;
};

// Formata data para DD/MM/YYYY
export const formatDateDMY = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Formata data para MM/YYYY
export const formatDateMY = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
};

const masks = {
  onlyDigits,
  maskCPF,
  maskCNPJ,
  maskPhoneBR,
  maskCEP,
  maskCurrency,
  formatMoney,
  parseMoneyToNumber,
  formatNumber,
  formatDateDMY,
  formatDateMY,
};

export default masks;
