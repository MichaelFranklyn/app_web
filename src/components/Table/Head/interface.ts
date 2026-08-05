import React from "react";
import { TableSortDirection } from "../interface";

export type TableHeadAlign = "left" | "center" | "right";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Nome da COLUNA NO BANCO por onde ordenar (`order_date`, `total_amount`).
   * Presente + `Table.Root sort={...}` = coluna ordenável.
   *
   * Tem de ser coluna real da entidade listada e estar declarada em
   * `sortableFields` no `useTableData`: o backend faz `getattr(model, campo)`,
   * e um nome inventado derruba a consulta em vez de ignorar a ordenação.
   */
  sortKey?: string;
  /**
   * Direção do PRIMEIRO clique. Texto começa em `asc` (A→Z), que é o default;
   * data e dinheiro começam em `desc`, porque quem clica em "Valor" quer ver o
   * maior — e não o menor, com um segundo clique pela frente.
   */
  sortFirst?: TableSortDirection;
  /** Alinhamento da coluna. `right` para números; o corpo acompanha. */
  align?: TableHeadAlign;
}
