import React from "react";
import { KpiStatus } from "./style";

export interface CardKpiValueProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: KpiStatus;
}

export type { KpiStatus };
