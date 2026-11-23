import { IconTile } from "@/components/IconTile";
import { cn } from "@/lib/utils";
import React from "react";
import { CardKpiLabelProps } from "./interface";
import { kpiLabelIconStyle, kpiLabelStyle, kpiLabelTextStyle } from "./style";

export const KpiLabel = React.forwardRef<HTMLDivElement, CardKpiLabelProps>(
  ({ icon: Icon, className, children, ...props }, ref) => (
    <div ref={ref} className={cn(kpiLabelStyle, className)} {...props}>
      <span className={kpiLabelTextStyle}>{children}</span>
      {Icon && (
        <IconTile
          color="blue"
          size="sm"
          shape="square"
          aria-hidden="true"
          className={kpiLabelIconStyle}
        >
          <Icon />
        </IconTile>
      )}
    </div>
  )
);

KpiLabel.displayName = "Card.Kpi.Label";
