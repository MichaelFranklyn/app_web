import { cn } from "@/lib/utils";
import React from "react";
import { isLongCellText, tableWrapStyle, withEmptyFallback } from "../utils";
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
      card,
      label,
      emptyText,
      cardHidden,
      children,
      ...props
    },
    ref
  ) => {
    const content = withEmptyFallback(children, emptyText);
    return (
      <td
        ref={ref}
        data-card={card}
        data-label={label}
        data-card-hidden={cardHidden || undefined}
        className={cn(
          tableCellBase,
          tableCellVariants[variant],
          tableCellAlignStyle[align],
          (wrap ?? isLongCellText(content)) && tableWrapStyle,
          className
        )}
        {...props}
      >
        {flex ? (
          <div className={tableCellFlex + " " + className}>{content}</div>
        ) : (
          content
        )}
      </td>
    );
  }
);

Cell.displayName = "Table.Cell";
