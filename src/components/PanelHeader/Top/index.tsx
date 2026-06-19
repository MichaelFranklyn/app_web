import { cn } from "@/lib/utils";
import React from "react";

export const Top = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between gap-4", className)}
    {...props}
  />
));

export const Left = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex min-w-0 flex-1 flex-col", className)}
    {...props}
  />
));

Left.displayName = "PanelHeader.Left";
Top.displayName = "PanelHeader.Top";
