import React from "react";

export interface CardKpiRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface KpiItem {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  negative?: boolean;
  status: "urgente" | "atencao" | "ok" | "neutral";
  valueClassName?: string;
}
