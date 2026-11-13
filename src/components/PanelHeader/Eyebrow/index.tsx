import { colorClasses } from "@/components/Title/style";
import { TitleColor } from "@/components/Title/interface";
import { cn } from "@/lib/utils";
import React from "react";

interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Cor do MÓDULO da tela (roxo no console, verde em Clientes). Sem ela, cada
   * tela pintava o eyebrow com `className="text-(--purple)"`.
   */
  color?: TitleColor;
}

export const Eyebrow = React.forwardRef<HTMLDivElement, EyebrowProps>(
  ({ color = "muted", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mb-[2px] text-[13px] font-medium tracking-[0.12em] uppercase",
        colorClasses[color],
        className
      )}
      {...props}
    />
  )
);

Eyebrow.displayName = "PanelHeader.Eyebrow";
