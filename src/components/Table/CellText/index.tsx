import React from "react";
import { cn } from "@/lib/utils";
import { tableCellVariants } from "../Cell/style";
import { isLongCellText, tableWrapStyle, withEmptyFallback } from "../utils";

export interface CellTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof tableCellVariants;
  /** Quebra de linha no desktop — ver `wrap` em `Table.Cell`. */
  wrap?: boolean;
}

export const CellText = React.forwardRef<HTMLSpanElement, CellTextProps>(
  ({ className, variant = "default", wrap, children, ...props }, ref) => {
    const content = withEmptyFallback(children);
    return (
      <span
        ref={ref}
        className={cn(
          tableCellVariants[variant],
          // `inline-block`: é o que faz o piso de largura valer num `span`.
          (wrap ?? isLongCellText(content)) &&
            `desktop:inline-block ${tableWrapStyle}`,
          className
        )}
        {...props}
      >
        {content}
      </span>
    );
  }
);

CellText.displayName = "Table.CellText";
