import { cn } from "@/lib/utils";
import React from "react";

export const Ellipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn(
      "font-head text-body-sm flex h-[28px] w-[28px] items-center justify-center tracking-widest text-(--color-text-muted)",
      className
    )}
    {...props}
  >
    {children || "..."}
    <span className="sr-only">Mais páginas</span>
  </span>
));

Ellipsis.displayName = "Pagination.Ellipsis";
