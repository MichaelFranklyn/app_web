import React from "react";
import { cn } from "@/lib/utils";
import { tableHeadStyle } from "./style";
import { TableHeadProps } from "./interface";

export const Head = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn(tableHeadStyle, className)} {...props} />
  )
);

Head.displayName = "Table.Head";
