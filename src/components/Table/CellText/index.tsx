import React from "react";
import { cn } from "@/lib/utils";
import { tableCellVariants } from "../Cell/style";

export interface CellTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof tableCellVariants;
}

export const CellText = React.forwardRef<HTMLSpanElement, CellTextProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(tableCellVariants[variant], className)}
      {...props}
    />
  )
);

CellText.displayName = "Table.CellText";
