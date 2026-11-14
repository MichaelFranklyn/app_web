import { cn } from "@/lib/utils";
import React from "react";

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-body-sm font-(--weight-semibold)", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";
