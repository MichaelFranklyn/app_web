export type VisitStatus =
  | "PENDING"
  | "COMPLETED"
  | "CLIENT_ABSENT"
  | "NO_TIME"
  | "RESCHEDULED"
  | "CANCELLED";

export type VisitStatusColor = "green" | "amber" | "neutral" | "red" | "blue";

/** Rótulos de exibição dos status de visita (fonte única). */
export const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  PENDING: "Pendente",
  COMPLETED: "Realizada",
  CLIENT_ABSENT: "Cliente ausente",
  NO_TIME: "Sem tempo",
  RESCHEDULED: "Remarcada",
  CANCELLED: "Cancelada",
};

/** Cor de badge por status de visita (fonte única). */
export const VISIT_STATUS_COLOR: Record<VisitStatus, VisitStatusColor> = {
  PENDING: "neutral",
  COMPLETED: "green",
  CLIENT_ABSENT: "red",
  NO_TIME: "blue",
  RESCHEDULED: "blue",
  CANCELLED: "red",
};

const toOptions = (map: Record<string, string>) =>
  Object.entries(map).map(([value, label]) => ({ value, label }));

/** Opções de status/resultado/estoque de visita para selects (fonte única). */
export const VISIT_STATUS_OPTIONS = toOptions(VISIT_STATUS_LABEL);

export const VISIT_OUTCOME_OPTIONS = [
  { value: "SOLD", label: "Vendeu" },
  { value: "NOT_BOUGHT", label: "Não comprou" },
  { value: "RESCHEDULED", label: "Reagendou" },
  { value: "CLOSED", label: "Fechado" },
];

export const STOCK_OBSERVATION_OPTIONS = [
  { value: "OUT_OF_STOCK", label: "Zerado" },
  { value: "LOW", label: "Baixo" },
  { value: "ADEQUATE", label: "Adequado" },
  { value: "HIGH", label: "Alto" },
];
