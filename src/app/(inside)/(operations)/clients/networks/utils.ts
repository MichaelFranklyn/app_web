import { FieldConfig } from "@/hooks/useTableState";

// Itens por página da lista de redes. Compartilhado entre a query e o
// useTableData para as variáveis não divergirem.
export const ITEMS_PER_PAGE = 10;

export const NETWORK_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "name" },
};
