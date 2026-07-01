import { cn } from "@/lib/utils";
import React from "react";

export const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "max-w-[260px] text-[13px] leading-[1.6] text-(--muted)",
      className
    )}
    {...props}
  >
    {children}
  </p>
));

Description.displayName = "EmptyState.Description";
