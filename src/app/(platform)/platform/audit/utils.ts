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
  { value: "create_platform_user", label: "Conta de suporte criada" },
  { value: "set_platform_user_status", label: "Acesso de suporte alterado" },
  { value: "release_email_suppression", label: "Email liberado do bloqueio" },
];
