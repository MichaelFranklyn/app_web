import React from "react";
import { ScoreColor } from "./style";

export interface TableScoreCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  score: number;
  color?: ScoreColor;
  noBar?: boolean;
  label?: React.ReactNode;
  /**
   * Ao lado do número, na mesma linha (ex.: as tags de situação do cliente no
   * cartão do celular). Esconda com `desktop:hidden` o que for só do cartão.
   */
  children?: React.ReactNode;
}
