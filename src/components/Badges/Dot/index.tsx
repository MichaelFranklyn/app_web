import { cn } from "@/lib/utils";
import * as React from "react";

export const BadgeDot = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("size-[6px] shrink-0 rounded-full bg-current", className)}
    aria-hidden="true"
    {...props}
  />
));
BadgeDot.displayName = "Badge.Dot";
