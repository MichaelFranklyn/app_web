import { cn } from "@/lib/utils";
import React from "react";

export const Actions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Mobile/tablet: tudo empilhado e full-width (inputs, botões e tags), o
      // que está ao lado desce, com gap de 8. Inputs com largura fixa e tags
      // (w-max) são forçados a full-width só aqui; no desktop volta ao natural.
      "max-desktop:[&_[data-input-root]]:w-full max-desktop:[&_[data-badge]]:w-full max-desktop:[&_[data-badge]]:justify-center desktop:w-auto desktop:shrink-0 desktop:flex-row desktop:flex-wrap desktop:items-center flex w-full flex-col items-stretch gap-8",
      className
    )}
    {...props}
  />
));

Actions.displayName = "PanelHeader.Actions";
