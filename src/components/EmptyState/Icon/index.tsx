import { cn } from "@/lib/utils";
import React from "react";

export const Icon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Disco tingido com anel: o ícone solto em cinza-claro sumia no fundo.
      // O tamanho do svg é decidido AQUI (as telas passam size={32} ou 36).
      "mb-[6px] flex size-[64px] items-center justify-center rounded-full bg-(--bg3) text-(--color-text-muted) ring-[6px] ring-(--bg3)/40 [&>svg]:size-[28px] [&>svg]:stroke-[1.75]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

Icon.displayName = "EmptyState.Icon";
