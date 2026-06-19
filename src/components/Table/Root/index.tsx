import React from "react";
import { cn } from "@/lib/utils";
import { tableRootStyle } from "./style";

export const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(tableRootStyle, className)} {...props} />
));

Root.displayName = "Table.Root";
