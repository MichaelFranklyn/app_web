import { colorClasses } from "@/components/Title/style";
import { TitleColor } from "@/components/Title/interface";
import { cn } from "@/lib/utils";
import React from "react";

interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Cor do MÓDULO da tela (roxo no console, verde em Clientes). Sem ela, cada
   * tela pintava o eyebrow com uma classe de cor solta.
   */
  color?: TitleColor;
}

export const Eyebrow = React.forwardRef<HTMLDivElement, EyebrowProps>(
  ({ color = "muted", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-body-sm mb-[2px] font-medium",
        colorClasses[color],
        className
      )}
      {...props}
    />
  )
);

Eyebrow.displayName = "PanelHeader.Eyebrow";
