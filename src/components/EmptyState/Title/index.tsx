import { cn } from "@/lib/utils";
import React from "react";

export const Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-head text-[15px] font-bold text-(--text2)",
      className
    )}
    {...props}
  >
    {children}
  </h3>
));

Title.displayName = "EmptyState.Title";
