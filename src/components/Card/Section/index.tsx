import { cn } from "@/lib/utils";
import React from "react";

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Traço em cima, separando do bloco anterior do mesmo card. */
  divided?: boolean;
}

/**
 * Um bloco empilhado dentro do card (o corpo rolável e o rodapé de ações de
 * uma coluna, por exemplo), quando o card tem mais de uma região.
 */
export const Section = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ divided = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-8 p-16",
        divided && "border-t border-(--border)",
        className
      )}
      {...props}
    />
  )
);

Section.displayName = "Card.Section";
