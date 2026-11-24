import { cn } from "@/lib/utils";
import React from "react";

export const Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-head text-body-md font-bold text-(--color-text)",
      className
    )}
    {...props}
  >
    {children}
  </h3>
));

Title.displayName = "EmptyState.Title";
