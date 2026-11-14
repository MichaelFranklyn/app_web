import { cn } from "@/lib/utils";
import React from "react";

type BreadcrumbSeparatorProps = React.HTMLAttributes<HTMLSpanElement>;

export const BreadcrumbSeparator = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbSeparatorProps
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    role="presentation"
    aria-hidden="true"
    className={cn(
      "flex items-center justify-center text-(--color-text-disabled)",
      className
    )}
    {...props}
  >
    {children || "/"}
  </span>
));

BreadcrumbSeparator.displayName = "Breadcrumb.Separator";
