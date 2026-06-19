import { cn } from "@/lib/utils";
import React from "react";
import { CardKpiDeltaProps } from "./interface";
import { kpiDeltaStyle } from "./style";

export const KpiDelta = React.forwardRef<HTMLDivElement, CardKpiDeltaProps>(
  ({ positive, negative, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(kpiDeltaStyle({ positive, negative }), className)}
      {...props}
    />
  )
);

KpiDelta.displayName = "Card.Kpi.Delta";
