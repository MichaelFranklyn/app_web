import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import React from "react";

interface EmptyStateRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Renderiza sem o Card (sem borda/fundo), para usar dentro de um Card.Body
   * existente e evitar card-dentro-de-card. Ex.: ContactCard, NotesCard.
   */
  flat?: boolean;
}

export const Root = React.forwardRef<HTMLDivElement, EmptyStateRootProps>(
  ({ className, children, flat = false, ...props }, ref) => {
    const layout = "flex w-full flex-col items-center gap-[10px] text-center";

    if (flat) {
      return (
        <div
          ref={ref}
          className={cn(layout, "px-[24px] py-[48px]", className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <Card.Root
        ref={ref}
        className={cn(
          // h-auto sobrescreve o h-full herdado do Card: um empty state
          // sempre tem a altura do conteúdo (senão o overflow-hidden corta).
          layout,
          "h-auto px-[24px] py-[48px]",
          className
        )}
        {...props}
      >
        {children}
      </Card.Root>
    );
  }
);

Root.displayName = "EmptyState.Root";
