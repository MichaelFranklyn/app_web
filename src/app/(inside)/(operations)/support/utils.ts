import { ActiveSort } from "@/hooks/useTableData";
import { FieldConfig } from "@/hooks/useTableState";

/** Itens por página da fila. Compartilhado entre a query e o `useTableData`. */
export const ITEMS_PER_PAGE = 10;

/**
 * Filtros da fila. `queryField` é a COLUNA no banco; os valores de situação,
 * tipo e urgência vão como NOME do enum e são traduzidos no resolver (ver
 * `_translate_enum_filters` no app_user).
 */
export const SUPPORT_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "title" },
  status: { type: "select", queryField: "status" },
  category: { type: "select", queryField: "category" },
  priority: { type: "select", queryField: "priority" },
  clientId: { type: "select", queryField: "client_id" },
};

/**
 * Colunas por onde a fila pode ser ordenada.
 *
 * Cliente e fábrica ficam de fora: o caso guarda o UUID delas, e ordenar por
 * UUID devolve uma ordem que a coluna não explica. "Esperando há" também não
 * entra — é derivada de `reported_at`, e ordenar por essa data dá exatamente o
 * mesmo resultado com um nome que o banco conhece.
 */
export const SUPPORT_SORTABLE_FIELDS = [
  "reported_at",
  "created_at",
  "status",
  "priority",
  "title",
];

/**
 * Ordem que o BACKEND aplica quando a tela não pede outra (ver
 * `_default_support_ordering`): o relato mais recente primeiro.
 *
 * Não entra nas variables — serve para o cabeçalho mostrar por onde a lista
 * está ordenada antes do primeiro clique. Um clique em "Esperando" inverte e dá
 * a leitura da fila: quem espera há mais tempo no topo.
 */
export const SUPPORT_DEFAULT_SORT: ActiveSort = {
  key: "reported_at",
  direction: "desc",
};
