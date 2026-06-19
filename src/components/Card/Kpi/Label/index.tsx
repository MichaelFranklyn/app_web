import { cn } from "@/lib/utils";
import React from "react";
import { CardKpiLabelProps } from "./interface";
import { kpiLabelStyle } from "./style";

export const KpiLabel = React.forwardRef<HTMLDivElement, CardKpiLabelProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(kpiLabelStyle, className)} {...props} />
  )
);

KpiLabel.displayName = "Card.Kpi.Label";
