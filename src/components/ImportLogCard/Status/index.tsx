import React from "react";
import { cn } from "@/lib/utils";

export const Status = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("shrink-0", className)} {...props} />
));

Status.displayName = "ImportLogCard.Status";
