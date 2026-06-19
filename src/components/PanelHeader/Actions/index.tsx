import { cn } from "@/lib/utils";
import React from "react";

export const Actions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex shrink-0 items-center gap-8", className)}
    {...props}
  />
));

Actions.displayName = "PanelHeader.Actions";
