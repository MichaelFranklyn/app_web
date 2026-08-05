export type TableSortDirection = "asc" | "desc";

/**
 * Ordenação vigente de uma tabela. Sai pronta de `useTableData().sort` e entra
 * inteira no `Table.Root`; cada `Table.Head` ordenável lê daí pelo contexto.
 */
export interface TableSort {
  /**
   * Coluna ordenada agora, ou `null` quando a lista está na ordem padrão do
   * backend. É o nome da COLUNA NO BANCO (`order_date`, `total_amount`) — não
   * o campo do GraphQL nem o rótulo da tela: quem ordena é o `ORDER BY`.
   */
  key: string | null;
  direction: TableSortDirection;
  /**
   * Alterna a ordenação da coluna. `firstDirection` é a direção do primeiro
   * clique — ver `Table.Head`.
   */
  onSort: (key: string, firstDirection?: TableSortDirection) => void;
}
