import { parseLocalDate } from "@/utils/format/date";

export const ORDER_STATUS_COLOR: Record<string, "blue" | "green" | "amber" | "neutral" | "red"> = {
  DRAFT: "neutral",
  SENT: "blue",
  CONFIRMED: "amber",
  DELIVERED: "green",
  CANCELLED: "red",
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  CONFIRMED: "Confirmado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const isContractExpired = (contractEnd: string | null): boolean => {
  const end = parseLocalDate(contractEnd);
  if (!end) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end < today;
};

export const getContractStatus = (contractEnd: string | null) => {
  const end = parseLocalDate(contractEnd);
  if (!end) return { label: "Sem prazo", color: undefined };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (end < today) return { label: "Expirado", color: "red" as const };
  const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 90) return { label: "A renovar", color: "amber" as const };
  return { label: "Vigente", color: "green" as const };
};

export const formatCommissionRate = (rate: number): string =>
  `${rate.toFixed(1).replace(".", ",")}%`;
