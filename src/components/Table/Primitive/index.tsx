import React from "react";
import { cn } from "@/lib/utils";
import { tablePrimitiveStyles } from "./style";

interface TablePrimitiveProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Limita a altura da lista e ativa scroll vertical; o cabeçalho fica fixo. */
  maxHeight?: number | string;
}

export const Primitive = React.forwardRef<HTMLTableElement, TablePrimitiveProps>(
  ({ className, maxHeight, ...props }, ref) => (
    <div
      className={cn(
        tablePrimitiveStyles.wrapper,
        maxHeight != null && tablePrimitiveStyles.scroll
      )}
      style={
        maxHeight != null
          ? {
              maxHeight:
                typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
            }
          : undefined
      }
    >
      <table ref={ref} className={cn(tablePrimitiveStyles.table, className)} {...props} />
    </div>
  )
);

Primitive.displayName = "Table.Table";
