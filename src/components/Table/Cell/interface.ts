import React from "react";
import { TableHeadAlign } from "../Head/interface";
import { tableCellVariants } from "./style";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  variant?: keyof typeof tableCellVariants;
  flex?: boolean;
  /**
   * Alinhamento do conteúdo. Use o MESMO do `Table.Head` da coluna: número
   * alinhado à direita só se lê como coluna de número quando o título
   * acompanha.
   */
  align?: TableHeadAlign;
}
