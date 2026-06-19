import React from "react";
import { cn } from "@/lib/utils";

export const Stats = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid grid-cols-2 gap-2", className)}
    {...props}
  />
));

Stats.displayName = "ImportLogCard.Stats";
