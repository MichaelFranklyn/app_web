import React from "react";
import { tableCellVariants } from "./style";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  variant?: keyof typeof tableCellVariants;
  flex?: boolean;
}
