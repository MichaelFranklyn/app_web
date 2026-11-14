import { cn } from "@/lib/utils";
import React from "react";
import { CardKpiRootProps } from "./interface";
import { kpiActiveStyle, kpiInteractiveStyle, kpiRootStyle } from "./style";

/**
 * O número de resumo do sistema — a única peça de KPI (auditoria UX, item 9:
 * `StatCard` e `ScoreCard` foram absorvidos aqui). Com `onClick`, vira o
 * cartão-filtro (`aria-pressed`).
 */
export const KpiRoot = React.forwardRef<HTMLElement, CardKpiRootProps>(
  ({ className, onClick, active = false, ...props }, ref) => {
    if (!onClick) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn(kpiRootStyle, className)}
          {...props}
        />
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          kpiRootStyle,
          kpiInteractiveStyle,
          active && kpiActiveStyle,
          className
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }
);

KpiRoot.displayName = "Card.Kpi";
