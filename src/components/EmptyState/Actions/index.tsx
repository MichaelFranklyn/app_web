import { cn } from "@/lib/utils";
import React from "react";

export const Actions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // `flex-wrap`: com dois botões ("Tentar novamente" + "Ir para o início")
      // a linha não cabia em 320px e o card, que é `overflow-hidden`, cortava o
      // segundo pela metade. Quebrar a linha é o que mantém os dois clicáveis.
      "mt-[8px] flex flex-wrap items-center justify-center gap-[8px]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

Actions.displayName = "EmptyState.Actions";
