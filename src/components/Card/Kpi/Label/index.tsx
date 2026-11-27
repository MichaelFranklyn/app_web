import { HelpTooltip } from "@/components/HelpTooltip";
import { cn } from "@/lib/utils";
import React from "react";
import { CardKpiLabelProps } from "./interface";
import { kpiLabelStyle, kpiLabelTextStyle } from "./style";

export const KpiLabel = React.forwardRef<HTMLDivElement, CardKpiLabelProps>(
  ({ help, className, children, ...props }, ref) => (
    <div ref={ref} className={cn(kpiLabelStyle, className)} {...props}>
      <span className={kpiLabelTextStyle}>
        {children}
        {help ? (
          // Caixa da altura de UMA linha do rótulo: o botão do "?" é mais alto
          // que o texto e, sem isso, esticava o rótulo e descia o número só
          // daquele cartão — a fileira saía desalinhada (27/11/2026).
          <span className="inline-flex h-[1lh] items-center align-middle">
            <HelpTooltip
              label={
                typeof children === "string"
                  ? `Sobre ${children}`
                  : "Sobre este número"
              }
              content={help}
            />
          </span>
        ) : null}
      </span>
    </div>
  )
);

KpiLabel.displayName = "Card.Kpi.Label";
