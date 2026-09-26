import { cn } from "@/lib/utils";
import React from "react";

/** Botões do aviso, à direita (e embaixo, quando a linha não comporta). */
export const AlertActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex shrink-0 items-center gap-8 self-center", className)}
    {...props}
  />
));
AlertActions.displayName = "AlertActions";
