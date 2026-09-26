import { cn } from "@/lib/utils";
import React from "react";

interface CardRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Linha que abre algo ao clicar: realce no hover e anel de foco. */
  interactive?: boolean;
}

/** Uma linha de lista dentro do card, separada da anterior por um traço. */
export const Row = React.forwardRef<HTMLDivElement, CardRowProps>(
  ({ interactive = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-12 border-t border-(--border) px-16 py-12",
        interactive &&
          "cursor-pointer transition-colors hover:bg-(--bg3) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)",
        className
      )}
      {...props}
    />
  )
);

Row.displayName = "Card.Row";
