import { cn } from "@/lib/utils";
import React from "react";
import { CardKpiValueProps } from "./interface";
import { kpiValueStyle } from "./style";

export const KpiValue = React.forwardRef<HTMLDivElement, CardKpiValueProps>(
  ({ status, size, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(kpiValueStyle({ status, size }), className)}
      {...props}
    />
  )
);

KpiValue.displayName = "Card.Kpi.Value";
