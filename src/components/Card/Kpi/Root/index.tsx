import { cn } from "@/lib/utils";
import React from "react";
import { CardKpiRootProps } from "./interface";
import { kpiRootStyle } from "./style";

export const KpiRoot = React.forwardRef<HTMLDivElement, CardKpiRootProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(kpiRootStyle, className)} {...props} />
  )
);

KpiRoot.displayName = "Card.Kpi";
