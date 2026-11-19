import { cn } from "@/lib/utils";
import React from "react";
import { CardRootProps } from "./interface";
import { rootStyle } from "./style";

export const Root = React.forwardRef<HTMLDivElement, CardRootProps>(
  (
    {
      accent,
      isCompact,
      tone,
      inset,
      dashed,
      interactive,
      elevated,
      lift,
      event,
      faded,
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      // Marca da superfície: peças de dentro (Alert) leem para não pôr sombra
      // sobre a sombra do card.
      data-slot="card"
      className={cn(
        rootStyle({
          accent,
          isCompact,
          tone,
          inset,
          dashed,
          interactive,
          elevated,
          lift,
          event,
          faded,
        }),
        className
      )}
      {...props}
    />
  )
);

Root.displayName = "Card.Root";
