import { cn } from "@/lib/utils";
import React from "react";

export const Icon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mb-[4px] flex items-center justify-center text-[33px] text-(--muted2)",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

Icon.displayName = "EmptyState.Icon";
