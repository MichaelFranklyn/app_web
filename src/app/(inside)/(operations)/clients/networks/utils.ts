import { FieldConfig } from "@/hooks/useTableState";

// Itens por página da lista de redes. Compartilhado entre a query e o
// useTableData para as variáveis não divergirem.
export const ITEMS_PER_PAGE = 10;

export const NETWORK_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "name" },
};

/**
 * Colunas por onde as redes podem ser ordenadas.
 *
 * Só `name`: lojas, faturamento e último pedido saem do DataLoader de stats
 * (`client_networks/loaders.py`), depois de a página já ter sido escolhida —
 * não são coluna de `client_networks` e o `ORDER BY` genérico não as alcança.
 * Ordenar por elas só reordenaria as dez linhas já baixadas, e "a rede que mais
 * comprou" seria a maior da página aberta.
 */
export const NETWORK_SORTABLE_FIELDS = ["name"];
