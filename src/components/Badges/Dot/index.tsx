import { cn } from "@/lib/utils";
import * as React from "react";

export const BadgeDot = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("h-5 w-5 shrink-0 rounded-full bg-current", className)}
    aria-hidden="true"
    {...props}
  />
));
BadgeDot.displayName = "Badge.Dot";
