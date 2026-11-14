import { cn } from "@/lib/utils";
import React from "react";

export const AlertContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex min-h-[24px] flex-1 flex-col justify-center gap-4 self-center",
      className
    )}
    {...props}
  />
));
AlertContent.displayName = "AlertContent";
