import { cn } from "@/lib/utils";
import React from "react";
import { isLongCellText, tableWrapStyle } from "../utils";
import { TableCellProps } from "./interface";
import {
  tableCellAlignStyle,
  tableCellBase,
  tableCellFlex,
  tableCellVariants,
} from "./style";

export const Cell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      className,
      variant = "default",
      align = "left",
      flex,
      wrap,
      children,
      ...props
    },
    ref
  ) => (
    <td
      ref={ref}
      className={cn(
        tableCellBase,
        tableCellVariants[variant],
        tableCellAlignStyle[align],
        (wrap ?? isLongCellText(children)) && tableWrapStyle,
        className
      )}
      {...props}
    >
      {flex ? (
        <div className={tableCellFlex + " " + className}>{children}</div>
      ) : (
        children
      )}
    </td>
  )
);

Cell.displayName = "Table.Cell";
