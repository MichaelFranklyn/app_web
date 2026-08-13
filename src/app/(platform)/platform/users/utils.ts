import { FieldConfig } from "@/hooks/useTableFilters";

export const ITEMS_PER_PAGE = 20;

export const TABLE_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "search" },
  role: { type: "select", queryField: "role" },
};

/**
 * O filtro vai pelo NOME do enum GraphQL, não pelo valor gravado no banco: é
 * assim que `platformUsers` compara. Ver `feedback_graphql_enum_names`.
 *
 * SU fica de fora das opções de propósito — filtrar a plataforma inteira para
 * achar as próprias contas de suporte não é uma pergunta que alguém faz.
 */
export const ROLE_OPTIONS = [
  { value: "OWNER", label: "Proprietário" },
  { value: "ADMIN", label: "Administrador" },
  { value: "SELLER", label: "Vendedor" },
];
