import React from "react";

export interface CardKpiRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface KpiItem {
  label: string;
  value: string;
  delta: string;
  /**
   * Explicação do número, mostrada num "?" ao lado do rótulo. Opcional: onde o
   * rótulo já é autoexplicativo o ícone só polui — mas em cartão que soma
   * dinheiro por um critério (só o faturado, só a mercadoria) ele é o que
   * impede a leitura errada.
   */
  help?: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
  status: "urgente" | "atencao" | "ok" | "neutral";
  valueClassName?: string;
}
