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
          <HelpTooltip
            label={
              typeof children === "string"
                ? `Sobre ${children}`
                : "Sobre este número"
            }
            content={help}
          />
        ) : null}
      </span>
    </div>
  )
);

KpiLabel.displayName = "Card.Kpi.Label";
