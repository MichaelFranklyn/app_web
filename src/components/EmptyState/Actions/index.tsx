import { cn } from "@/lib/utils";
import React from "react";

export const Actions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-[8px] flex items-center justify-center gap-[8px]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

Actions.displayName = "EmptyState.Actions";
