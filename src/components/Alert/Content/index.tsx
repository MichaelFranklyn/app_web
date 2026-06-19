import { cn } from "@/lib/utils";
import React from "react";

export const AlertContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-col justify-center gap-2", className)}
    {...props}
  />
));
AlertContent.displayName = "AlertContent";
