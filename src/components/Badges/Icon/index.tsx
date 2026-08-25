import { cn } from "@/lib/utils";
import * as React from "react";
import { HTMLAttributes, ReactNode } from "react";

interface BadgeIconProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export const BadgeIcon = React.forwardRef<HTMLSpanElement, BadgeIconProps>(
  ({ children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        // 12px, e não `h-3`: a escala de spacing deste projeto é em PIXELS
        // (`--spacing-3: 3px` em globals.css), não a do Tailwind padrão, onde
        // `h-3` valeria 0.75rem. Escrito como `h-3`, o ícone saía com 3px de
        // lado — um ponto cinza ilegível ao lado de um texto de 13px, em todo
        // badge com ícone do sistema.
        "inline-flex shrink-0 [&>svg]:h-12 [&>svg]:w-12",
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {children}
    </span>
  )
);
BadgeIcon.displayName = "Badge.Icon";
