import React from "react";
import { ScoreColor } from "./style";

export interface TableScoreCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  score: number;
  color?: ScoreColor;
  noBar?: boolean;
  label?: React.ReactNode;
}
