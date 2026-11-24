import React from "react";

export interface CardKpiGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Os cartões (`Card.Kpi` ou `Card.Kpi.Skeleton`). `null`/`false` não contam. */
  children: React.ReactNode;
}
