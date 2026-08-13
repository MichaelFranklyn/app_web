import { FieldConfig } from "@/hooks/useTableFilters";

export const ITEMS_PER_PAGE = 20;

export const TABLE_FIELDS: Record<string, FieldConfig> = {
  action: { type: "select", queryField: "action" },
};

/**
 * Os valores são os que vão para o banco (minúsculos), não os nomes do enum
 * GraphQL: a trilha é lida pelo `ListUseCase` genérico, que compara a coluna
 * `action` direto — não há tradução no caminho, ao contrário de
 * `platformUsers`, onde o filtro de papel passa por normalização.
 */
export const ACTION_OPTIONS = [
  { value: "suspend_company", label: "Empresa suspensa" },
  { value: "reactivate_company", label: "Empresa reativada" },
  { value: "update_plan", label: "Plano alterado" },
  { value: "issue_access_link", label: "Link de acesso emitido" },
  { value: "impersonate_user", label: "Sessão de suporte" },
];

/** Data e hora: duas ações do mesmo dia se distinguem pela hora, e é a
 * sequência do dia que se reconstrói ao investigar. */
export const formatMoment = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
