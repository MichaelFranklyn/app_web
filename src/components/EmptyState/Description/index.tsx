import { cn } from "@/lib/utils";
import React from "react";

export const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-body-sm max-w-[320px] leading-[1.6] text-(--color-text-muted)",
      className
    )}
    {...props}
  >
    {children}
  </p>
));

Description.displayName = "EmptyState.Description";
