export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatCurrency(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function factoryName(factory: { nomeFantasia: string | null; razaoSocial: string } | null): string {
  if (!factory) return "—";
  return factory.nomeFantasia ?? factory.razaoSocial;
}

export function priorityLabel(p: string | null): string {
  if (p === "alta") return "Alta";
  if (p === "media") return "Média";
  if (p === "baixa") return "Baixa";
  return "—";
}

export function priorityColor(p: string | null): "red" | "amber" | "neutral" {
  if (p === "alta") return "red";
  if (p === "media") return "amber";
  return "neutral";
}

export function orderStatusLabel(s: string): string {
  const map: Record<string, string> = {
    rascunho: "Rascunho",
    enviado: "Enviado",
    confirmado: "Confirmado",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };
  return map[s] ?? s;
}

export function orderStatusColor(s: string): "neutral" | "blue" | "amber" | "green" | "red" {
  const map: Record<string, "neutral" | "blue" | "amber" | "green" | "red"> = {
    rascunho: "neutral",
    enviado: "blue",
    confirmado: "amber",
    entregue: "green",
    cancelado: "red",
  };
  return map[s] ?? "neutral";
}

import {
  StockObservation,
  VisitOutcome,
  VisitStatus,
} from "./interface";

type BadgeColor = "neutral" | "blue" | "amber" | "green" | "red";

export const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  PENDING: "Pendente",
  COMPLETED: "Realizada",
  CLIENT_ABSENT: "Ausente",
  NO_TIME: "Sem tempo",
  RESCHEDULED: "Remarcada",
  CANCELLED: "Cancelada",
};

export const VISIT_STATUS_COLOR: Record<VisitStatus, BadgeColor> = {
  PENDING: "neutral",
  COMPLETED: "green",
  CLIENT_ABSENT: "red",
  NO_TIME: "blue",
  RESCHEDULED: "blue",
  CANCELLED: "red",
};

export const VISIT_OUTCOME_LABEL: Record<VisitOutcome, string> = {
  SOLD: "Vendeu",
  NOT_BOUGHT: "Não comprou",
  RESCHEDULED: "Reagendou",
  CLOSED: "Fechado",
};

export const VISIT_OUTCOME_COLOR: Record<VisitOutcome, BadgeColor> = {
  SOLD: "green",
  NOT_BOUGHT: "neutral",
  RESCHEDULED: "blue",
  CLOSED: "amber",
};

export const STOCK_OBSERVATION_LABEL: Record<StockObservation, string> = {
  OUT_OF_STOCK: "Zerado",
  LOW: "Baixo",
  ADEQUATE: "Adequado",
  HIGH: "Alto",
};

export const STOCK_OBSERVATION_COLOR: Record<StockObservation, BadgeColor> = {
  OUT_OF_STOCK: "red",
  LOW: "amber",
  ADEQUATE: "green",
  HIGH: "green",
};

export function stockSituation(
  daysSinceStockout: number,
  churnRisk: string,
): { label: string; color: "red" | "amber" | "green" } {
  if (daysSinceStockout > 0) return { label: "Zerado", color: "red" };
  if (churnRisk === "alto") return { label: "Crítico", color: "amber" };
  if (churnRisk === "medio") return { label: "Baixo", color: "amber" };
  return { label: "OK", color: "green" };
}

export function formatCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function buildAddress(data: {
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
}): string {
  const parts = [
    data.addressStreet,
    data.addressNumber,
    data.addressComplement,
    data.addressNeighborhood ? `Bairro ${data.addressNeighborhood}` : null,
    data.addressCity && data.addressState
      ? `${data.addressCity} / ${data.addressState}`
      : data.addressCity ?? data.addressState,
    data.addressZip ? `CEP ${data.addressZip}` : null,
  ].filter(Boolean);
  return parts.join(", ") || "—";
}
